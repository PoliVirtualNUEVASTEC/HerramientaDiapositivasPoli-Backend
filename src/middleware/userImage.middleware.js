import multer from 'multer'

import { USER_IMAGE_MAX_UPLOAD_BYTES, USER_IMAGE_MAX_UPLOAD_MB } from '../config/userImage.config.js'

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: USER_IMAGE_MAX_UPLOAD_BYTES,
    files: 1
  }
})

export const userImageUploadMiddleware = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: `La imagen excede el límite de ${USER_IMAGE_MAX_UPLOAD_MB} MB`
        })
      }

      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          error: 'Solo se permite subir una imagen por petición'
        })
      }

      return res.status(400).json({ error: `Error de carga: ${err.message}` })
    }

    if (err) {
      return res.status(400).json({ error: err.message })
    }

    const uploadedImage = req.files?.[0]

    if (!uploadedImage) {
      return res.status(400).json({
        error: 'No se recibió ninguna imagen en multipart/form-data'
      })
    }

    req.file = uploadedImage
    next()
  })
}
