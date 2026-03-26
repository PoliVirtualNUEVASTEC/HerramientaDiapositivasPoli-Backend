import { PDFParse } from 'pdf-parse'
import { getPresentationById, savePresentation, getPresentations } from '../services/presentation.service.js'

const data = {
  title: 'Introducción a la Inteligencia Artificial',
  description: 'Presentación generada automáticamente',
  theme: {
    background: '#ffffff',
    fontFamily: 'Arial',
    primaryColor: '#4f46e5'
  },
  slides: [
    {
      title: 'Portada',
      slideOrder: 1,
      background: {
        type: 'color',
        value: '#ffffff'
      },
      elements: [
        {
          type: 'title',
          content: {
            text: 'Inteligencia Artificial'
          },
          positionX: 100,
          positionY: 150,
          width: 760,
          height: 100,
          styles: {
            fontSize: 48,
            fontWeight: 'bold',
            color: '#111827',
            textAlign: 'center'
          },
          order: 1
        },
        {
          type: 'text',
          content: {
            text: 'Una introducción a los conceptos básicos'
          },
          positionX: 200,
          positionY: 260,
          width: 560,
          height: 60,
          styles: {
            fontSize: 22,
            color: '#6b7280',
            textAlign: 'center'
          },
          order: 2
        }
      ]
    },
    {
      title: '¿Qué es la IA?',
      slideOrder: 2,
      background: {
        type: 'color',
        value: '#f9fafb'
      },
      elements: [
        {
          type: 'title',
          content: {
            text: '¿Qué es la IA?'
          },
          positionX: 60,
          positionY: 50,
          width: 500,
          height: 80,
          styles: {
            fontSize: 36,
            fontWeight: 'bold',
            color: '#111827'
          },
          order: 1
        },
        {
          type: 'text',
          content: {
            text: 'La inteligencia artificial permite a las máquinas aprender, razonar y tomar decisiones.'
          },
          positionX: 60,
          positionY: 140,
          width: 500,
          height: 120,
          styles: {
            fontSize: 20,
            lineHeight: 1.6,
            color: '#374151'
          },
          order: 2
        },
        {
          type: 'image',
          content: {
            url: 'https://via.placeholder.com/300x200'
          },
          positionX: 600,
          positionY: 150,
          width: 300,
          height: 200,
          styles: {
            borderRadius: 12
          },
          order: 3
        }
      ]
    },
    {
      title: 'Aplicaciones',
      slideOrder: 3,
      background: {
        type: 'color',
        value: '#ffffff'
      },
      elements: [
        {
          type: 'title',
          content: {
            text: 'Aplicaciones de la IA'
          },
          positionX: 60,
          positionY: 50,
          width: 600,
          height: 80,
          styles: {
            fontSize: 34,
            fontWeight: 'bold'
          },
          order: 1
        },
        {
          type: 'list',
          content: {
            items: [
              'Asistentes virtuales',
              'Vehículos autónomos',
              'Recomendaciones en plataformas',
              'Diagnóstico médico'
            ]
          },
          positionX: 80,
          positionY: 140,
          width: 500,
          height: 200,
          styles: {
            fontSize: 20,
            color: '#111827'
          },
          order: 2
        }
      ]
    }
  ]
}

export class PresentationController {
  async createPresentationFromPDF (req, res) {
    try {
      const userId = req.user.id

      if (!req.file) {
        return res.status(400).json({
          error: 'No se envió ningún archivo PDF'
        })
      }

      const parser = new PDFParse({
        data: req.file.buffer
      })

      const result = await parser.getText()
      const pdfText = result.text
      const cleanText = pdfText.trim()

      // Validación REAL de contenido
      if (!cleanText || cleanText.length < 50 || cleanText.split(/\s+/).length < 10) {
        return res.status(400).json({
          error: 'El PDF no contiene texto suficiente o es un documento escaneado'
        })
      }

      // Guardar en RAM (lo importante para tu app)
      const presentationText = cleanText

      // Debug útil (solo preview)
      console.log('Preview del PDF:')
      console.log(presentationText.substring(0, 300))

      const presentation = await savePresentation(data, userId)
      // console.log(presentation)

      res.status(201).json({
        message: 'Presentación creada correctamente',
        presentationId: presentation.id,
        title: presentation.title,
        createdAt: presentation.createdAt
      })
    } catch (error) {
      console.error('Error creating presentation from PDF:', error)

      return res.status(500).json({
        error: 'Failed to create presentation from PDF'
      })
    }
  }

  async createPresentationFromText (req, res) {
    try {
      const { text } = req.body
      const userId = req.user.id

      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          error: 'No se recibió texto'
        })
      }

      // Guardar en RAM
      const presentationText = text.trim()

      console.log('Texto recibido:')
      console.log(presentationText.substring(0, 300))

      const presentation = await savePresentation(data, userId)
      // console.log(presentation)

      res.status(201).json({
        message: 'Presentación creada correctamente',
        presentationId: presentation.id,
        title: presentation.title,
        createdAt: presentation.createdAt
      })
    } catch (error) {
      console.error('Error creating presentation from text:', error)

      return res.status(500).json({
        error: 'Failed to create presentation from text'
      })
    }
  }

  async getPresentation (req, res) {
    try {
      const { id } = req.params

      const presentation = await getPresentationById(id)

      res.json(presentation)
    } catch (error) {
      res.status(404).json({
        error: error.message
      })
    }
  }

  async getPresentations (req, res) {
    try {
      const id = req.user.id

      const presentations = await getPresentations(id)

      res.json(presentations)
    } catch (error) {
      res.status(404).json({
        error: error.message
      })
    }
  }
}
