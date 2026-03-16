export const textMiddleware = (req, res, next) => {
  const { text } = req.body

  // verificar que exista texto
  if (!text) {
    return res.status(400).json({
      error: 'No se recibió texto'
    })
  }

  // eliminar espacios innecesarios
  const cleanText = text.trim()

  // verificar que no esté vacío
  if (cleanText.length === 0) {
    return res.status(400).json({
      error: 'El texto está vacío'
    })
  }

  // límite de tamaño (ej: 20000 caracteres)
  if (cleanText.length > 20000) {
    return res.status(400).json({
      error: 'El texto excede el límite permitido'
    })
  }

  console.log('Texto validado correctamente')

  // guardar texto limpio en RAM
  req.presentationText = cleanText

  next()
}
