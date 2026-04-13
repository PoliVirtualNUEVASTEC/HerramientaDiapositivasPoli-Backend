import { Slide } from '../models/relations.js'
import { Op } from 'sequelize'

export class SlideController {
  async createSlide (req, res) {
    try {
      const { presentationId, title, slideOrder, background } = req.body

      console.log('Datos recibidos:', { presentationId, title, slideOrder, background })

      if (!presentationId) {
        return res.status(400).json({ error: 'presentationId is required' })
      }

      // Si no se proporciona slideOrder, colocarlo al final
      let order = slideOrder
      if (order === undefined) {
        const maxOrder = await Slide.max('slideOrder', { where: { presentationId } }) || 0
        order = maxOrder + 1
        console.log('Orden calculado:', order)
      } else {
        // Incrementar el orden de los slides existentes >= order
        console.log('Incrementando ordenes >=', order)
        await Slide.increment('slideOrder', { where: { presentationId, slideOrder: { [Op.gte]: order } } })
      }

      console.log('Creando slide con:', { presentationId, title, slideOrder: order, background })
      const newSlide = await Slide.create({ presentationId, title, slideOrder: order, background })
      console.log('Slide creado:', newSlide.id)
      return res.status(201).json(newSlide)
    } catch (error) {
      console.error('Error creating slide:', error)
      return res.status(500).json({ error: 'Failed to create slide' })
    }
  }

  async getSlides (req, res) {
    try {
      const { presentationId } = req.params

      const slides = await Slide.findAll({
        where: { presentationId },
        order: [['slideOrder', 'ASC']]
      })
      return res.json(slides)
    } catch (error) {
      console.error('Error fetching slides:', error)
      return res.status(500).json({ error: 'Failed to fetch slides' })
    }
  }

  async getSlideById (req, res) {
    try {
      const { id } = req.params
      const slide = await Slide.findByPk(id)
      if (!slide) {
        return res.status(404).json({ error: 'Slide not found' })
      }
      return res.json(slide)
    } catch (error) {
      console.error('Error fetching slide:', error)
      return res.status(500).json({ error: 'Failed to fetch slide' })
    }
  }

  async updateSlide (req, res) {
    try {
      const { id } = req.params
      const { title, slideOrder, background } = req.body

      const slide = await Slide.findByPk(id)
      if (!slide) {
        return res.status(404).json({ error: 'Slide not found' })
      }

      const oldOrder = slide.slideOrder
      const newOrder = slideOrder !== undefined ? slideOrder : oldOrder

      if (newOrder !== oldOrder) {
        const presentationId = slide.presentationId
        // Si el nuevo orden es menor, incrementar los entre new y old-1
        if (newOrder < oldOrder) {
          await Slide.increment('slideOrder', { where: { presentationId, slideOrder: { [Op.between]: [newOrder, oldOrder - 1] } } })
        } else {
          // Si mayor, decrementar los entre old+1 y new
          await Slide.decrement('slideOrder', { where: { presentationId, slideOrder: { [Op.between]: [oldOrder + 1, newOrder] } } })
        }
      }

      await slide.update({ title, slideOrder: newOrder, background })
      return res.json(slide)
    } catch (error) {
      console.error('Error updating slide:', error)
      return res.status(500).json({ error: 'Failed to update slide' })
    }
  }

  async deleteSlide (req, res) {
    try {
      const { id } = req.params
      console.log('=== DELETE SLIDE DEBUG ===')
      console.log('ID recibido (tipo):', id, typeof id)
      console.log('ID como número:', Number(id))

      const slide = await Slide.findByPk(id)
      console.log('Resultado de findByPk:', slide)
      console.log('Slide encontrado:', slide ? `ID: ${slide.id}, Title: ${slide.title}` : 'NO ENCONTRADO')

      if (!slide) {
        console.log('Retornando 404 - Slide not found')
        return res.status(404).json({ error: 'Slide not found' })
      }

      const presentationId = slide.presentationId
      const deletedOrder = slide.slideOrder
      console.log('Datos del slide a eliminar:', { id: slide.id, presentationId, deletedOrder })

      await slide.destroy()
      console.log('Slide destruido exitosamente')

      // Decrementar el orden de los slides con orden > deletedOrder
      console.log('Decrementando ordenes >', deletedOrder, 'para presentationId:', presentationId)
      const updateResult = await Slide.decrement('slideOrder', { where: { presentationId, slideOrder: { [Op.gt]: deletedOrder } } })
      console.log('Resultado del decrement:', updateResult)

      console.log('=== DELETE COMPLETADO ===')
      return res.status(204).send()
    } catch (error) {
      console.error('=== ERROR EN DELETE ===')
      console.error('Error completo:', error)
      console.error('Stack:', error.stack)
      return res.status(500).json({ error: 'Failed to delete slide' })
    }
  }
}
