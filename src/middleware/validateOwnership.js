import { Presentation, Slide, SlideElement, UserImage } from '../models/relations.js'

export async function validateSlideOwnership (req, res, next) {
  const slideId = req.params.slideId || req.body.slideId
  if (!slideId) {
    return res.status(400).json({ error: 'slideId es obligatorio' })
  }

  const slide = await Slide.findByPk(slideId)
  if (!slide) {
    return res.status(404).json({ error: 'Slide no encontrado' })
  }

  const presentation = await Presentation.findByPk(slide.presentationId)
  if (!presentation) {
    return res.status(404).json({ error: 'Presentación asociada no encontrada' })
  }

  if (presentation.userId !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para modificar este recurso' })
  }

  req.slide = slide
  req.presentation = presentation
  next()
}

export async function validateSlideElementOwnership (req, res, next) {
  const { id } = req.params
  const slideElement = await SlideElement.findByPk(id)
  if (!slideElement) {
    return res.status(404).json({ error: 'Elemento de diapositiva no encontrado' })
  }

  const slide = await Slide.findByPk(slideElement.slideId)
  if (!slide) {
    return res.status(404).json({ error: 'Slide asociado no encontrado' })
  }

  const presentation = await Presentation.findByPk(slide.presentationId)
  if (!presentation) {
    return res.status(404).json({ error: 'Presentación asociada no encontrada' })
  }

  if (presentation.userId !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para modificar este recurso' })
  }

  req.slideElement = slideElement
  req.slide = slide
  req.presentation = presentation
  next()
}

export async function validateUserImageOwnership (req, res, next) {
  const { id } = req.params
  const userImage = await UserImage.findByPk(id)

  if (!userImage) {
    return res.status(404).json({ error: 'Imagen no encontrada' })
  }

  if (userImage.userId !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para modificar este recurso' })
  }

  req.userImage = userImage
  next()
}
