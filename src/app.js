import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'

import { userRoutes } from './routes/user.routes.js'
import { loginRoutes } from './routes/login.routes.js'
import { presentationRoutes } from './routes/presentation.routes.js'
import { slideRoutes } from './routes/slide.routes.js'
import { slideElementsRoutes } from './routes/slideElements.routes.js'
import { userImageRoutes } from './routes/userImage.routes.js'

export const app = express()
app.use(express.json())
app.use(cookieParser())

const origins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (origins.includes('*') || origins.includes(origin)) return callback(null, true)
    callback(new Error('CORS not allowed by origin'))
  },
  credentials: true
}))

app.use('/api/users/', userRoutes)
app.use('/api/auth/', loginRoutes)
app.use('/api/presentations', presentationRoutes)
app.use('/api/slides', slideRoutes)
app.use('/api/slide-elements', slideElementsRoutes)
app.use('/api/user-images', userImageRoutes)
