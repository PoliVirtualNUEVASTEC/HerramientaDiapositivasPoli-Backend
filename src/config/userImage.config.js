const toPositiveInteger = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10)

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    return fallback
  }

  return parsedValue
}

export const USER_IMAGE_BUCKET = process.env.SUPABASE_IMAGE_BUCKET || 'user-images'
export const USER_IMAGE_MAX_ITEMS = toPositiveInteger(process.env.USER_IMAGE_MAX_ITEMS, 50)
export const USER_IMAGE_MAX_AGE_DAYS = toPositiveInteger(process.env.USER_IMAGE_MAX_AGE_DAYS, 90)
export const USER_IMAGE_MAX_DIMENSION = toPositiveInteger(process.env.USER_IMAGE_MAX_DIMENSION, 1920)
export const USER_IMAGE_QUALITY = toPositiveInteger(process.env.USER_IMAGE_QUALITY, 82)
export const USER_IMAGE_MAX_UPLOAD_MB = toPositiveInteger(process.env.USER_IMAGE_MAX_UPLOAD_MB, 8)
export const USER_IMAGE_MAX_UPLOAD_BYTES = USER_IMAGE_MAX_UPLOAD_MB * 1024 * 1024
export const USER_IMAGE_CLEANUP_INTERVAL_HOURS = toPositiveInteger(process.env.USER_IMAGE_CLEANUP_INTERVAL_HOURS, 12)
