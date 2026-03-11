import { User } from '../models/relations.js'
import bcrypt from 'bcrypt'

export class UserController {
  async createUser (req, res) {
    try {
      const { fullName, email, password } = req.body
      const passwordHash = await bcrypt.hash(password, 10)
      const user = await User.create({ fullName, email, passwordHash })
      return res.status(201).json({ fullName: user.fullName, email: user.email })
    } catch (error) {
      console.error('Error creating user:', error)
      return res.status(500).json({ error: 'Failed to create user' })
    }
  }

  async getUsers (req, res) {
    try {
      const users = await User.findAll()
      return res.json(users)
    } catch (error) {
      console.error('Error fetching users:', error)
      return res.status(500).json({ error: 'Failed to fetch users' })
    }
  }

  async getUserById (req, res) {
    try {
      const { id } = req.params
      const user = await User.findByPk(id)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }
      return res.json(user)
    } catch (error) {
      console.error('Error fetching user:', error)
      return res.status(500).json({ error: 'Failed to fetch user' })
    }
  }

  async updateUser (req, res) {
    try {
      const { id } = req.params
      const user = await User.findByPk(id)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }
      await user.update(req.body)
      return res.json(user)
    } catch (error) {
      console.error('Error updating user:', error)
      return res.status(500).json({ error: 'Failed to update user' })
    }
  }

  async deleteUser (req, res) {
    try {
      const { id } = req.params
      const user = await User.findByPk(id)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }
      await user.destroy()
      return res.status(204).send()
    } catch (error) {
      console.error('Error deleting user:', error)
      return res.status(500).json({ error: 'Failed to delete user' })
    }
  }
}
