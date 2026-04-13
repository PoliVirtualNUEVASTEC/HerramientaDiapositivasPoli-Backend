import { Router } from 'express'
import { SlideElementsController } from '../controllers/slideElements.controller.js'
import { authMiddleware } from '../middleware/authtoken.js'
import { validateSlideElementOwnership, validateSlideOwnership } from '../middleware/validateOwnership.js'

export const slideElementsRoutes = Router()
const slideElementsController = new SlideElementsController()

slideElementsRoutes.post('/', authMiddleware, validateSlideOwnership, slideElementsController.createSlideElement)
slideElementsRoutes.get('/slide/:slideId', authMiddleware, validateSlideOwnership, slideElementsController.getElementsBySlide)
slideElementsRoutes.get('/:id', authMiddleware, validateSlideElementOwnership, slideElementsController.getSlideElementById)
slideElementsRoutes.put('/:id', authMiddleware, validateSlideElementOwnership, slideElementsController.updateSlideElement)
slideElementsRoutes.delete('/:id', authMiddleware, validateSlideElementOwnership, slideElementsController.deleteSlideElement)
