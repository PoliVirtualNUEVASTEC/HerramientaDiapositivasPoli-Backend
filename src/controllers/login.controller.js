import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User, PasswordResetToken } from '../models/relations.js'
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js'
import { Op } from 'sequelize'
import crypto from 'crypto'
import { Resend } from 'resend'

export class LoginController {
  async login (req, res) {
    const { email, password } = req.body

    const user = await User.findOne({ where: { email: { [Op.iLike]: email } } })

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)

    if (!valid) {
      return res.status(401).json({ message: 'Password incorrecto' })
    }

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    await user.update({ refreshToken })

    const isProduction = process.env.NODE_ENV === 'production'

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 15 * 60 * 1000
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({ message: 'Login exitoso' })
  }

  async refresh (req, res) {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      return res.status(403).json({ message: 'No autorizado' })
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      )

      const user = await User.findByPk(decoded.id)

      if (!user || user.refreshToken !== refreshToken) {
        return res.status(403).json({
          message: 'Refresh token inválido'
        })
      }

      const newAccessToken = generateAccessToken(user)

      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        maxAge: 15 * 60 * 1000
      })

      res.json({
        message: 'Token renovado'
      })
    } catch (error) {
      return res.status(403).json({
        message: 'Refresh token expirado'
      })
    }
  }

  async logOut (req, res) {
    const refreshToken = req.cookies.refreshToken

    const user = await User.findOne({
      where: { refreshToken }
    })

    if (user) {
      await user.update({ refreshToken: null })
    }

    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.json({
      message: 'Logout exitoso'
    })
  }

  async getProfile (req, res) {
    try {
      const id = req.user.id
      const user = await User.findByPk(id)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }
      return res.json({ fullName: user.fullName, email: user.email })
    } catch (error) {
      console.error('Error fetching user:', error)
      return res.status(500).json({ error: 'Failed to fetch user' })
    }
  }

  // POST /auth/forgot-password
  async forgotPassword (req, res) {
    const { email } = req.body

    try {
      const user = await User.findOne({ where: { email } })

      if (!user) {
        return res.json({ message: 'Si el correo existe, se enviará un link' })
      }

      await PasswordResetToken.destroy({
        where: { userId: user.id }
      })

      const token = crypto.randomBytes(32).toString('hex')

      await PasswordResetToken.create({
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
      })

      const frontendUrl = process.env.FRONTEND_URL
      const resetLink = `${frontendUrl}/reset-password?token=${token}`

      const resend = new Resend(process.env.RESEND_API_KEY)

      await resend.emails.send({
        from: 'no-replay@presentai-mail.juajsia.lat',
        to: user.email,
        subject: 'Recuperar contraseña',
        html: `
    <h2>Recuperación de contraseña</h2>
    <p>Haz click en el siguiente enlace:</p>
    <a href="${resetLink}">Restablecer contraseña</a>
    <p>Este enlace expira en 30 minutos.</p>
  `
      })

      res.json({ message: 'Correo enviado' })
    } catch (error) {
      console.error('Error fetching user:', error)
      return res.status(500).json({ error: 'Failed to fetch user', err: error })
    }
  }

  // GET /auth/validate-reset-token?token=xxx
  async validateToken (req, res) {
    const { token } = req.query

    const record = await PasswordResetToken.findOne({
      where: { token }
    })

    if (!record) {
      return res.status(400).json({ valid: false })
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ valid: false, message: 'Token expirado' })
    }

    res.json({ valid: true })
  }

  // POST /auth/reset-password
  async resetPassword (req, res) {
    const { token, newPassword } = req.body

    const record = await PasswordResetToken.findOne({
      where: { token }
    })

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Token inválido o expirado' })
    }

    const user = await User.findByPk(record.userId)

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    await record.destroy()

    res.json({ message: 'Contraseña actualizada' })
  }
}
