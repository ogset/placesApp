import fs from 'fs'
import express from 'express'
import connectDB from './config/db.js'
import { config } from 'dotenv'
import path from 'path'

import usersRoutes from './routes/users-routes.js'
import placesRoutes from './routes/places-routes.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'

config()
connectDB()

const app = express()

app.use('/uploads/images', express.static(path.join('uploads', 'images')))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')

  next()
})
app.use(express.json())
app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err)
    })
  }

  if (res.headerSent) {
    return next(error)
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || 'An unkown error occured!' })
})
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`)
)
