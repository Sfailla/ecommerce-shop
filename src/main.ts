import express, { Application, Request, Response } from 'express'
import dotenv from 'dotenv'
import logger from 'morgan'
import cors from 'cors'

import { makeDbConnection } from './db/index.js'
import { productRoutes, categoryRoutes, userRoutes, orderRoutes } from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/handlers.js'

const isProduction = process.env.NODE_ENV === 'production'

// initialize env variables
dotenv.config()

// initialize express
export const app: Application = express()

// initialize express middleware
app.use(cors())
app.options('*', cors())
app.use(logger('dev'))
app.use(express.json())

makeDbConnection()

// initialize routes
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/categories', categoryRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/orders', orderRoutes)

// initialize custom middleware
app.use(notFoundHandler)
app.use(errorHandler)

// error handling
if (isProduction) {
  app.use((err: Error, _req: Request, res: Response) => {
    res.status(500).json({
      message: `Something went wrong ${err.message}`
    })
  })
}

app.listen(3000, () => console.log('listening on port 3000'))
