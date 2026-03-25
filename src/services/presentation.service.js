// services/presentation.service.js

import { sequelize } from '../db/database.js'
import { Presentation, SlideElement, Slide } from '../models/relations.js'

export async function savePresentation (data, userId) {
  const transaction = await sequelize.transaction()

  try {
    if (!data?.slides || !Array.isArray(data.slides)) {
      throw new Error('El JSON no tiene una estructura válida (slides)')
    }

    const presentation = await Presentation.create({
      userId,
      title: data.title || 'Sin título',
      description: data.description || '',
      theme: data.theme || {}
    }, { transaction })

    for (const [slideIndex, slideData] of data.slides.entries()) {
      const slide = await Slide.create({
        presentationId: presentation.id,
        title: slideData.title || '',
        slideOrder: slideData.slideOrder ?? slideIndex,
        background: slideData.background || {}
      }, { transaction })

      if (slideData.elements && Array.isArray(slideData.elements)) {
        for (const [elIndex, el] of slideData.elements.entries()) {
          if (!el.type || !el.content) {
            throw new Error(`Elemento inválido en slide ${slideIndex}`)
          }

          await SlideElement.create({
            slideId: slide.id,
            type: el.type,
            content: el.content,
            positionX: el.positionX ?? 0,
            positionY: el.positionY ?? 0,
            width: el.width ?? 100,
            height: el.height ?? 50,
            styles: el.styles || {},
            order: el.order ?? elIndex
          }, { transaction })
        }
      }
    }

    // Commit si todo sale bien
    await transaction.commit()

    return presentation
  } catch (error) {
    // Rollback si algo falla
    await transaction.rollback()
    throw error
  }
}

export async function getPresentationById (presentationId) {
  const presentation = await Presentation.findByPk(presentationId, {
    include: [
      {
        model: Slide,
        include: [
          {
            model: SlideElement
          }
        ]
      }
    ],
    order: [
      [Slide, 'slideOrder', 'ASC'],
      [Slide, SlideElement, 'order', 'ASC']
    ]
  })

  if (!presentation) {
    throw new Error('Presentación no encontrada')
  }

  // Transformación al JSON esperado
  const formatted = {
    id: presentation.id,
    title: presentation.title,
    description: presentation.description,
    theme: presentation.theme,
    slides: presentation.Slides.map(slide => ({
      id: slide.id,
      title: slide.title,
      slideOrder: slide.slideOrder,
      background: slide.background,
      elements: slide.SlideElements.map(el => ({
        id: el.id,
        type: el.type,
        content: el.content,
        positionX: el.positionX,
        positionY: el.positionY,
        width: el.width,
        height: el.height,
        styles: el.styles,
        order: el.order
      }))
    }))
  }

  return formatted
}
