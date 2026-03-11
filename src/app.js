import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import { userRoutes } from './routes/user.routes.js'

export const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/users/', userRoutes)
