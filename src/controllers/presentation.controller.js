import { createRequire } from 'module'

import { Presentation } from '../models/relations.js'
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

export class PresentationController {
  async createPresentationFromPDF (req, res) {
    try {
      const { title } = req.body
      const data = await pdfParse(req.file.buffer)
      if (!data.text || data.text.trim().length === 0) {
        return res.status(400).json({ error: 'No se pudo extraer texto del PDF' })
      }
      const presentation = await Presentation.create({
        title: title || req.file.originalname.replace('.pdf', ''),
        description: data.text.trim(),
        userId: req.user.id
      })
      return res.status(201).json(presentation)
    } catch (error) {
      console.error('Error creating presentation from PDF:', error)
      return res.status(500).json({ error: 'Failed to create presentation from PDF' })
    }
  }
}
