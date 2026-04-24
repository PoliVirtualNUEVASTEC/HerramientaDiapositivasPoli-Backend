import { Router } from 'express'

import { UserImageController } from '../controllers/userImage.controller.js'
import { authMiddleware } from '../middleware/authtoken.js'
import { userImageUploadMiddleware } from '../middleware/userImage.middleware.js'
import { validateUserImageOwnership } from '../middleware/validateOwnership.js'

export const userImageRoutes = Router()
const userImageController = new UserImageController()

userImageRoutes.post('/', authMiddleware, userImageUploadMiddleware, userImageController.uploadImage)
userImageRoutes.get('/', authMiddleware, userImageController.listUserImages)
userImageRoutes.post('/:id/access', authMiddleware, validateUserImageOwnership, userImageController.markImageAsAccessed)
userImageRoutes.delete('/:id', authMiddleware, validateUserImageOwnership, userImageController.deleteImage)
