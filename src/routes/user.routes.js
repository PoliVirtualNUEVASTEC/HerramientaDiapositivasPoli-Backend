import { Router } from 'express'
import { UserController } from '../controllers/user.controller.js'

export const userRoutes = Router()
const userController = new UserController()

userRoutes.post('/', userController.createUser)
userRoutes.get('/', userController.getUsers)
userRoutes.get('/:id', userController.getUserById)
userRoutes.put('/:id', userController.updateUser)
userRoutes.delete('/:id', userController.deleteUser)
