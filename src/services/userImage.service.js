import crypto from 'crypto'
import sharp from 'sharp'
import { Op } from 'sequelize'

import supabase from '../db/supabase.js'
import { UserImage } from '../models/relations.js'
import {
  USER_IMAGE_BUCKET,
  USER_IMAGE_CLEANUP_INTERVAL_HOURS,
  USER_IMAGE_MAX_AGE_DAYS,
  USER_IMAGE_MAX_DIMENSION,
  USER_IMAGE_MAX_ITEMS,
  USER_IMAGE_QUALITY
} from '../config/userImage.config.js'

const STORAGE_CACHE_CONTROL = '31536000'

export class UserImageValidationError extends Error {
  constructor (message) {
    super(message)
    this.name = 'UserImageValidationError'
  }
}

const buildUserImagePath = (userId) => {
  const randomSuffix = crypto.randomBytes(8).toString('hex')
  return `users/${userId}/${Date.now()}-${randomSuffix}.webp`
}

export const optimizeImageBuffer = async (buffer) => {
  try {
    return await sharp(buffer, { failOn: 'none' })
      .rotate()
      .resize({
        width: USER_IMAGE_MAX_DIMENSION,
        height: USER_IMAGE_MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({
        quality: USER_IMAGE_QUALITY,
        effort: 4
      })
      .toBuffer()
  } catch (error) {
    throw new UserImageValidationError('El archivo no es una imagen compatible')
  }
}

const removeImagesFromBucket = async (paths) => {
  if (!paths.length) {
    return
  }

  const { error } = await supabase.storage
    .from(USER_IMAGE_BUCKET)
    .remove(paths)

  if (error) {
    throw new Error(`No se pudieron borrar imágenes del bucket: ${error.message}`)
  }
}

export const deleteUserImages = async (images) => {
  if (!images.length) {
    return { deletedCount: 0, deletedIds: [] }
  }

  const ids = images.map(image => image.id)
  const paths = [...new Set(images.map(image => image.path).filter(Boolean))]

  await removeImagesFromBucket(paths)
  await UserImage.destroy({ where: { id: ids } })

  return { deletedCount: ids.length, deletedIds: ids }
}

export const cleanupExpiredUserImages = async ({ userId } = {}) => {
  const expirationDate = new Date(Date.now() - (USER_IMAGE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000))
  const where = {
    lastAccessedAt: {
      [Op.lt]: expirationDate
    }
  }

  if (userId) {
    where.userId = userId
  }

  const staleImages = await UserImage.findAll({
    where,
    order: [
      ['lastAccessedAt', 'ASC'],
      ['createdAt', 'ASC']
    ]
  })

  if (!staleImages.length) {
    return { deletedCount: 0, deletedIds: [] }
  }

  return deleteUserImages(staleImages)
}

export const enforceUserImageLimit = async (userId) => {
  const images = await UserImage.findAll({
    where: { userId },
    order: [
      ['lastAccessedAt', 'ASC'],
      ['createdAt', 'ASC'],
      ['id', 'ASC']
    ]
  })

  const overflow = images.length - USER_IMAGE_MAX_ITEMS

  if (overflow <= 0) {
    return { deletedCount: 0, deletedIds: [] }
  }

  const imagesToDelete = images.slice(0, overflow)
  return deleteUserImages(imagesToDelete)
}

export const uploadUserImage = async ({ userId, fileBuffer }) => {
  const optimizedBuffer = await optimizeImageBuffer(fileBuffer)
  const storagePath = buildUserImagePath(userId)

  const { error: uploadError } = await supabase.storage
    .from(USER_IMAGE_BUCKET)
    .upload(storagePath, optimizedBuffer, {
      contentType: 'image/webp',
      cacheControl: STORAGE_CACHE_CONTROL,
      upsert: false
    })

  if (uploadError) {
    throw new Error(`No se pudo subir la imagen al bucket: ${uploadError.message}`)
  }

  try {
    const { data } = supabase.storage
      .from(USER_IMAGE_BUCKET)
      .getPublicUrl(storagePath)

    const userImage = await UserImage.create({
      userId,
      url: data.publicUrl,
      path: storagePath,
      lastAccessedAt: new Date()
    })

    return {
      userImage,
      optimizedBytes: optimizedBuffer.length
    }
  } catch (error) {
    await removeImagesFromBucket([storagePath])
    throw error
  }
}

export const touchUserImageAccess = async (userImage) => {
  await userImage.update({ lastAccessedAt: new Date() })
  return userImage
}

export const runUserImageMaintenance = async () => {
  return cleanupExpiredUserImages()
}

export const startUserImageMaintenance = () => {
  const intervalMs = USER_IMAGE_CLEANUP_INTERVAL_HOURS * 60 * 60 * 1000

  if (intervalMs <= 0) {
    return null
  }

  const timer = setInterval(() => {
    runUserImageMaintenance().catch((error) => {
      console.error('Error running user image maintenance:', error)
    })
  }, intervalMs)

  if (typeof timer.unref === 'function') {
    timer.unref()
  }

  return timer
}
