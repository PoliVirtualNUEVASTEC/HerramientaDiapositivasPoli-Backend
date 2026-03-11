import jwt from 'jsonwebtoken'

export function authMiddleware (req, res, next) {
  const token = req.cookies.accessToken

  if (!token) {
    return res.status(401).json({ message: 'No autenticado' })
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    )

    req.user = decoded

    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Token expirado'
    })
  }
}
