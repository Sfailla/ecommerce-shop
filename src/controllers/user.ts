import { NextFunction, Request, Response } from 'express'
import { DbModel } from '../types/shared'
import { User, UserClass } from '../types/user'
import { CustomError } from '../utils/customErrors.js'
import { comparePasswordBcrypt, generateAuthToken, hashPasswordBcrypt } from '../utils/helperFns.js'

export default class UserController implements UserClass {
  constructor(private readonly userDb: DbModel<User>) {
    this.userDb = userDb
  }

  getUserCount = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await this.userDb.count()
      if (!count) throw new CustomError('issue finding user count')
      res.status(200).json({ success: true, count })
    } catch (error) {
      next(error)
    }
  }

  getUsers = async (_req: Request, res: Response) => {
    try {
      const users: User[] = await this.userDb.find()
      res.status(200).json({ success: true, users })
    } catch (error) {
      res.status(500).json({
        success: false,
        error
      })
    }
  }

  getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user: User = await this.userDb.findById(req.params.id)
      if (!user) throw new CustomError('issue finding user by id')
      res.status(200).json({ success: true, user })
    } catch (error) {
      next(error)
    }
  }

  createUser = async (req: Request, res: Response) => {
    try {
      const hashedPassword = await hashPasswordBcrypt(req.body.password)
      const user: User = await this.userDb.create({ ...req.body, password: hashedPassword })
      if (!user) throw new CustomError('issue creating user')
      const token = generateAuthToken(user)
      res.set('x-auth-token', token)
      res.status(200).json({ success: true, message: 'user created successfully', user, token })
    } catch (error) {
      res.status(500).json({
        success: false,
        error
      })
    }
  }

  updateUser = async (req: Request, res: Response) => {
    try {
      const user: User = await this.userDb.findByIdAndUpdate(req.params.id, req.body, {
        new: true
      })
      if (!user) throw new CustomError(`issue updating user with id: ${req.params.id}`)
      res.status(200).json({ success: true, message: 'user updated successfully', user })
    } catch (error) {
      res.status(500).json({
        success: false,
        error
      })
    }
  }

  deleteUser = async (req: Request, res: Response) => {
    try {
      const user: User = await this.userDb.findByIdAndDelete(req.params.id)
      if (!user) throw new CustomError(`issue deleting user with id: ${req.params.id}`)
      res.status(200).json({ success: true, message: 'user deleted successfully', user })
    } catch (error) {
      res.status(500).json({
        success: false,
        error
      })
    }
  }

  // AUTHORIZATION METHODS

  login = async (req: Request, res: Response) => {
    try {
      const user: User = await this.userDb.findOne({ email: req.body.email })
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'user not found'
        })
        return
      }
      const isPasswordValid = await comparePasswordBcrypt(req.body.password, user.password)
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'invalid password'
        })
        return
      }
      const token = generateAuthToken(user)
      res.set('x-auth-token', token)
      res.status(200).json({ success: true, message: 'user logged in successfully', user, token })
    } catch (error) {
      res.status(500).json({
        success: false,
        error
      })
    }
  }
}
