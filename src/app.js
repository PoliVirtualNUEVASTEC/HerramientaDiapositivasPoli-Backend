import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'

import { userRoutes } from './routes/user.routes.js'
import { loginRoutes } from './routes/login.routes.js'

export const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))

app.use('/api/users/', userRoutes)
app.use('/api/auth/', loginRoutes)
