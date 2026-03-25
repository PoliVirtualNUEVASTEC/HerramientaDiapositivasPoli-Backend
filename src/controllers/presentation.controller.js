import { PDFParse } from 'pdf-parse'
import { Presentation } from '../models/relations.js'

export class PresentationController {
  async createPresentationFromPDF (req, res) {
    try {
      const { title, description } = req.body

      if (!req.file) {
        return res.status(400).json({
          error: 'No se envió ningún archivo PDF'
        })
      }

      const parser = new PDFParse({
        data: req.file.buffer
      })

      const result = await parser.getText()

      const pdfText = result.text || result.textVal

      if (!pdfText || typeof pdfText !== 'string') {
        return res.status(400).json({
          error: 'No se pudo extraer texto del PDF (puede ser escaneado o inválido)'
        })
      }

      const cleanText = pdfText.trim()

      // Guardar en RAM (lo importante para tu app)
      const presentationText = cleanText

      // Debug útil (solo preview)
      console.log('Preview del PDF:')
      console.log(presentationText.substring(0, 300))

      // (opcional pero recomendado) procesar texto
      const slides = presentationText.split('. ').slice(0, 5)

      console.log('Slides generadas:', slides)

      const presentation = await Presentation.create({
        title: title || req.file.originalname.replace('.pdf', ''),
        description: description || 'Presentación generada desde PDF',
        userId: req.user.id
      })

      return res.status(201).json({
        message: 'PDF procesado correctamente',
        slidesPreview: slides,
        presentation
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

      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          error: 'No se recibió texto'
        })
      }

      // Guardar en RAM
      const presentationText = text.trim()

      console.log('Texto recibido:')
      console.log(presentationText.substring(0, 300))

      // misma lógica que PDF
      const slides = presentationText.split('. ').slice(0, 5)

      console.log('Slides generadas:', slides)

      const presentation = await Presentation.create({
        title: 'Presentación desde texto',
        description: 'Generada a partir de texto ingresado',
        userId: req.user.id
      })

      return res.status(201).json({
        message: 'Texto procesado correctamente',
        slidesPreview: slides,
        presentation
      })
    } catch (error) {
      console.error('Error creating presentation from text:', error)

      return res.status(500).json({
        error: 'Failed to create presentation from text'
      })
    }
  }
}
