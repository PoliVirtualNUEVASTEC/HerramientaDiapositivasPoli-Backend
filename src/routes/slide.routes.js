import { Router } from 'express'
import { SlideController } from '../controllers/slide.controller.js'
import { authMiddleware } from '../middleware/authtoken.js'

export const slideRoutes = Router()
const slideController = new SlideController()

slideRoutes.get('/:presentationId', authMiddleware, slideController.getSlides)
slideRoutes.get('/slide/:id', authMiddleware, slideController.getSlideById)
slideRoutes.post('/', authMiddleware, slideController.createSlide)
slideRoutes.put('/:id', authMiddleware, slideController.updateSlide)
slideRoutes.delete('/:id', authMiddleware, slideController.deleteSlide)
