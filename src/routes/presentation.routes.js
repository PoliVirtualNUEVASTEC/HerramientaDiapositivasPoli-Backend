import { Router } from 'express'
import { PresentationController } from '../controllers/presentation.controller.js'
import { authMiddleware } from '../middleware/authtoken.js'
import { uploadMiddleware } from '../middleware/upload.middleware.js'

export const presentationRoutes = Router()
const presentationController = new PresentationController()

presentationRoutes.post('/pdf', authMiddleware, uploadMiddleware, presentationController.createPresentationFromPDF)
