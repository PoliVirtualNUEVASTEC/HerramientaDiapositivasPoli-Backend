export async function searchPexelsImage (imageRequest) {
  if (!process.env.PEXELS_API_KEY) {
    throw new Error('No se encontró PEXELS_API_KEY en las variables de entorno.')
  }

  if (!imageRequest || !imageRequest.query) {
    return null
  }

  const orientationMap = {
    horizontal: 'landscape',
    vertical: 'portrait',
    square: 'square'
  }

  const query = `${imageRequest.query} ${imageRequest.style || ''}`.trim()

  const params = new URLSearchParams({
    query,
    orientation: orientationMap[imageRequest.orientation] || 'landscape',
    per_page: '1'
  })

  const response = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: {
      Authorization: process.env.PEXELS_API_KEY
    }
  })

  if (!response.ok) {
    throw new Error(`Error consultando Pexels: ${response.status}`)
  }

  const data = await response.json()
  const photo = data.photos && data.photos[0]

  if (!photo) {
    return null
  }

  return {
    url: photo.src.landscape || photo.src.large || photo.src.original,
    alt: photo.alt || imageRequest.query,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    pexelsUrl: photo.url
  }
}
