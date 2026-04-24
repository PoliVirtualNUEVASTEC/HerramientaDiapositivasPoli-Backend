import { UserImage } from '../models/relations.js'
import {
  cleanupExpiredUserImages,
  deleteUserImage,
  DuplicateUserImageError,
  enforceUserImageLimit,
  UserImageValidationError,
  touchUserImageAccess,
  uploadUserImage
} from '../services/userImage.service.js'
import { USER_IMAGE_MAX_ITEMS } from '../config/userImage.config.js'

export class UserImageController {
  async uploadImage (req, res) {
    try {
      const userId = req.user.id

      if (!req.file) {
        return res.status(400).json({ error: 'No se recibió ninguna imagen' })
      }

      const staleCleanup = await cleanupExpiredUserImages({ userId })
      const { userImage, optimizedBytes } = await uploadUserImage({
        userId,
        fileBuffer: req.file.buffer
      })
      const limitCleanup = await enforceUserImageLimit(userId)

      return res.status(201).json({
        message: 'Imagen subida correctamente',
        image: userImage,
        optimizedBytes,
        policy: {
          maxImagesPerUser: USER_IMAGE_MAX_ITEMS,
          deletedStaleImages: staleCleanup.deletedCount,
          deletedOverflowImages: limitCleanup.deletedCount
        }
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      if (error instanceof DuplicateUserImageError) {
        return res.status(409).json({
          error: error.message,
          image: error.existingImage
        })
      }

      if (error instanceof UserImageValidationError) {
        return res.status(400).json({ error: error.message })
      }

      return res.status(500).json({ error: error.message || 'Error al subir la imagen' })
    }
  }

  async listUserImages (req, res) {
    try {
      const userId = req.user.id

      await cleanupExpiredUserImages({ userId })

      const images = await UserImage.findAll({
        where: { userId },
        order: [
          ['lastAccessedAt', 'DESC'],
          ['createdAt', 'DESC']
        ]
      })

      return res.json(images)
    } catch (error) {
      console.error('Error listing user images:', error)
      return res.status(500).json({ error: 'Error al obtener las imágenes del usuario' })
    }
  }

  async markImageAsAccessed (req, res) {
    try {
      const updatedImage = await touchUserImageAccess(req.userImage)
      return res.json(updatedImage)
    } catch (error) {
      console.error('Error updating image access date:', error)
      return res.status(500).json({ error: 'Error al actualizar el acceso de la imagen' })
    }
  }

  async deleteImage (req, res) {
    try {
      await deleteUserImage(req.userImage)
      return res.status(204).send()
    } catch (error) {
      console.error('Error deleting user image:', error)
      return res.status(500).json({ error: 'Error al eliminar la imagen' })
    }
  }
}
