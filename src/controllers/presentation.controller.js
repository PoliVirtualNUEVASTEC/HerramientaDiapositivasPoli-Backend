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
}
