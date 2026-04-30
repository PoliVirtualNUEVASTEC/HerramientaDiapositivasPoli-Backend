import { PDFParse } from 'pdf-parse'
import { getPresentationById, savePresentation, getPresentations, generatePresentation } from '../services/presentation.service.js'
import { Presentation } from '../models/relations.js'
// import { createRequire } from 'module'

// const require = createRequire(import.meta.url)
// const presentationTemplate = require('../slides_templates/presentationTemplate.json')
// const presentationTemplate = require('../slides_templates/ia.json')

export class PresentationController {
  async createPresentationFromPDF (req, res) {
    try {
      const userId = req.user.id
      const numberOfSlides = req.body.numberOfSlides

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

      const presentationText = cleanText

      // Debug útil (solo preview)
      console.log('Preview del PDF:')
      console.log(presentationText.substring(0, 300))

      const presentationAI = await generatePresentation({ text: presentationText, title: '', numberOfSlides })

      const presentation = await savePresentation(presentationAI, userId)

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
      const { text, numberOfSlides } = req.body
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

      const presentationAI = await generatePresentation({ text: presentationText, title: '', numberOfSlides })

      const presentation = await savePresentation(presentationAI, userId)
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

  async deletePresentation (req, res) {
    try {
      const { id } = req.params
      const presentation = await Presentation.findByPk(id)
      if (!presentation) {
        return res.status(404).json({ error: 'Presentation not found' })
      }
      await presentation.destroy()
      return res.status(204).send()
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete presentation' })
    }
  }
}
