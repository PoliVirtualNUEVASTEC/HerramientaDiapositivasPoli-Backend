import { PDFParse } from 'pdf-parse'
import { Presentation } from '../models/relations.js'

export class PresentationController {
  async createPresentationFromPDF (req, res) {
    try {
      const { title, description } = req.body

      if (!req.file) {
        return res.status(400).json({ error: 'No se envió ningún archivo PDF' })
      }

      const parser = new PDFParse({
        data: req.file.buffer
      })

      const result = await parser.getText()

      const pdfText = result.text

      if (!pdfText || pdfText.trim().length === 0) {
        return res.status(400).json({ error: 'No se pudo extraer texto del PDF' })
      }

      const presentation = await Presentation.create({
        title: title || req.file.originalname.replace('.pdf', ''),
        description: description || 'Presentación generada desde PDF',
        userId: req.user.id
      })

      return res.status(201).json(presentation)
    } catch (error) {
      console.error('Error creating presentation from PDF:', error)
      return res.status(500).json({ error: 'Failed to create presentation from PDF' })
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

      const presentationText = text.trim() // queda en RAM
      // aquí se procesará el texto
      console.log(presentationText)

      const presentation = await Presentation.create({
        title: 'Presentación desde texto',
        description: 'Generada a partir de texto ingresado',
        userId: req.user.id
      })

      return res.status(201).json({
        message: 'Texto recibido correctamente',
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
