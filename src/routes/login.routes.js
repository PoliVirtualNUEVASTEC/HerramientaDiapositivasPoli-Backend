import { Router } from 'express'
import { LoginController } from '../controllers/login.controller.js'
import { authMiddleware } from '../middleware/authtoken.js'

export const loginRoutes = Router()
const loginController = new LoginController()

loginRoutes.post('/login', loginController.login)
loginRoutes.post('/refresh', loginController.refresh)
loginRoutes.post('/logout', loginController.logOut)
loginRoutes.get('/profile', authMiddleware, loginController.getProfile)
loginRoutes.post('/forgot-password', loginController.forgotPassword)
loginRoutes.get('/validate-reset-token', loginController.validateToken)
loginRoutes.post('/reset-password', loginController.resetPassword)
