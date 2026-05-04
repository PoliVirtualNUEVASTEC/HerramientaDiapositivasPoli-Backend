import { Router } from 'express'
import { PresentationController } from '../controllers/presentation.controller.js'
import { authMiddleware } from '../middleware/authtoken.js'
import { pdfMiddleware } from '../middleware/pdf.middleware.js'
import { textMiddleware } from '../middleware/text.middleware.js'

export const presentationRoutes = Router()
const presentationController = new PresentationController()

presentationRoutes.post('/pdf', authMiddleware, pdfMiddleware, presentationController.createPresentationFromPDF)
presentationRoutes.post('/text', authMiddleware, textMiddleware, presentationController.createPresentationFromText)
presentationRoutes.get('/:id', authMiddleware, presentationController.getPresentation)
presentationRoutes.get('/', authMiddleware, presentationController.getPresentations)
presentationRoutes.delete('/:id', authMiddleware, presentationController.deletePresentation)
