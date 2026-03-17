import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '../models/relations.js'
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js'
import { Op } from 'sequelize'

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

    // guardar refresh token en DB
    await user.update({ refreshToken })

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
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
        secure: false,
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
}
