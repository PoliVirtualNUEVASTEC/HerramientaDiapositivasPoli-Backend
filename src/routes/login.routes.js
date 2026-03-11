import { Router } from 'express'
import { LoginController } from '../controllers/login.controller.js'

export const loginRoutes = Router()
const loginController = new LoginController()

loginRoutes.post('/login', loginController.login)
loginRoutes.post('/refresh', loginController.refresh)
loginRoutes.post('/logout', loginController.logOut)
