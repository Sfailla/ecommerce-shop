import { NextFunction, Request, Response } from 'express'

export interface ProductFilters {
  category?: string | string[]
}
export interface ProductClass {
  getProducts(req: Request, res: Response, next: NextFunction): Promise<void>
  getProduct(req: Request, res: Response, next: NextFunction): Promise<void>
  getProductCount(req: Request, res: Response, next: NextFunction): Promise<void>
  getFeaturedProducts(req: Request, res: Response, next: NextFunction): Promise<void>
  createProduct(req: Request, res: Response, next: NextFunction): Promise<void>
  updateProduct(req: Request, res: Response, next: NextFunction): Promise<void>
  deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void>
}

export interface Product {
  id: string
  name: string
  description: string
  richDescription: string
  image: string
  images: string[]
  brand: string
  price: number
  category: string
  countInStock: number
  rating: number
  numReviews: number
  isFeatured: boolean
  createdAt: Date
}
