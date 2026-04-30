// services/presentation.service.js

import { sequelize } from '../db/database.js'
import { Presentation, SlideElement, Slide } from '../models/relations.js'
import {
  generatePresentationWithAI
} from './openai.service.js'

import {
  searchPexelsImage
} from './pexels.service.js'

const TEMPLATE_BACKGROUNDS = {
  cover:
    'https://qftsvgnhxcqdrcarvsiq.supabase.co/storage/v1/object/public/images/slides/title_slide.jpg',
  content:
    'https://qftsvgnhxcqdrcarvsiq.supabase.co/storage/v1/object/public/images/slides/slide1.jpg',
  end:
    'https://qftsvgnhxcqdrcarvsiq.supabase.co/storage/v1/object/public/images/slides/end_slide.jpg'
}

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

export async function getPresentations (id) {
  const presentations = await Presentation.findAll({
    where: {
      userId: id
    },
    attributes: ['id', 'title', 'description', 'createdAt']
  })

  if (!presentations) {
    throw new Error('presentaciones no encontradas')
  }

  return presentations
}

function applyFixedBackgrounds (presentation) {
  const totalSlides = presentation.slides.length

  presentation.slides = presentation.slides.map((slide, index) => {
    let backgroundUrl = TEMPLATE_BACKGROUNDS.content

    if (index === 0) {
      backgroundUrl = TEMPLATE_BACKGROUNDS.cover
    }

    if (index === totalSlides - 1) {
      backgroundUrl = TEMPLATE_BACKGROUNDS.end
    }

    return {
      ...slide,
      background: {
        type: 'image',
        url: backgroundUrl
      }
    }
  })

  return presentation
}

async function resolvePresentationImages (presentation) {
  for (const slide of presentation.slides) {
    if (!slide.elements) continue

    for (const element of slide.elements) {
      if (element.type !== 'image') continue

      const imageRequest = element.content && element.content.image

      if (!imageRequest) continue

      try {
        const resolvedImage = await searchPexelsImage(imageRequest)

        element.content = {
          ...element.content,
          resolvedImage
        }
      } catch (error) {
        console.error('Error resolviendo imagen:', error.message)

        element.content = {
          ...element.content,
          resolvedImage: null
        }
      }
    }
  }

  return presentation
}

export async function generatePresentation ({ text, title, numberOfSlides }) {
  const generatedPresentation = await generatePresentationWithAI({
    text,
    title,
    numberOfSlides
  })

  const finalslide = {
    title: 'Cierre Presentación',
    slideOrder: generatedPresentation.slides.length + 1
  }

  generatedPresentation.slides.push(finalslide)

  const presentationWithBackgrounds = applyFixedBackgrounds(generatedPresentation)

  const finalPresentation = await resolvePresentationImages(
    presentationWithBackgrounds
  )

  return finalPresentation
}
