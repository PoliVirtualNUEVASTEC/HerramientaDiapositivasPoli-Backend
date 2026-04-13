import { SlideElement } from '../models/relations.js'
import { validateSlideElementPayload } from '../utils/validateSlideElementPayload.js'

const CONTENT_EXAMPLES = {
  text: { text: 'Texto de ejemplo' },
  title: { text: 'Título de ejemplo' },
  image: { url: 'https://example.com/imagen.jpg' },
  list: { items: ['Primer punto', 'Segundo punto'] }
}

export class SlideElementsController {
  async createSlideElement (req, res) {
    const { slideId, type, content, positionX, positionY, width, height, styles, order } = req.body

    if (!slideId) {
      return res.status(400).json({ error: 'slideId es obligatorio' })
    }

    const validation = validateSlideElementPayload({ type, content })
    if (!validation.valid) {
      return res.status(400).json({
        error: validation.message,
        examples: CONTENT_EXAMPLES
      })
    }

    try {
      const slideElement = await SlideElement.create({
        slideId,
        type,
        content,
        positionX,
        positionY,
        width,
        height,
        styles,
        order
      })

      return res.status(201).json(slideElement)
    } catch (error) {
      console.error('Error creating slide element:', error)
      return res.status(500).json({ error: 'Error al crear el elemento de la diapositiva' })
    }
  }

  async getElementsBySlide (req, res) {
    const { slideId } = req.params

    try {
      const elements = await SlideElement.findAll({
        where: { slideId },
        order: [['order', 'ASC']]
      })

      return res.json(elements)
    } catch (error) {
      console.error('Error fetching slide elements:', error)
      return res.status(500).json({ error: 'Error al obtener los elementos de la diapositiva' })
    }
  }

  async getSlideElementById (req, res) {
    return res.json(req.slideElement)
  }

  async updateSlideElement (req, res) {
    const { slideElement } = req
    const { type, content, positionX, positionY, width, height, styles, order } = req.body
    const finalType = type || slideElement.type
    const finalContent = content || slideElement.content

    const validation = validateSlideElementPayload({ type: finalType, content: finalContent })
    if (!validation.valid) {
      return res.status(400).json({
        error: validation.message,
        examples: CONTENT_EXAMPLES
      })
    }

    try {
      slideElement.type = finalType
      slideElement.content = finalContent
      if (positionX !== undefined) slideElement.positionX = positionX
      if (positionY !== undefined) slideElement.positionY = positionY
      if (width !== undefined) slideElement.width = width
      if (height !== undefined) slideElement.height = height
      if (styles !== undefined) slideElement.styles = styles
      if (order !== undefined) slideElement.order = order

      await slideElement.save()

      return res.json(slideElement)
    } catch (error) {
      console.error('Error updating slide element:', error)
      return res.status(500).json({ error: 'Error al actualizar el elemento de la diapositiva' })
    }
  }

  async deleteSlideElement (req, res) {
    try {
      await req.slideElement.destroy()
      return res.status(204).send()
    } catch (error) {
      console.error('Error deleting slide element:', error)
      return res.status(500).json({ error: 'Error al eliminar el elemento de la diapositiva' })
    }
  }
}
