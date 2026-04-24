const SLIDE_ELEMENT_TYPES = ['text', 'title', 'image', 'list']

export function validateSlideElementPayload ({ type, content }) {
  if (!type || !SLIDE_ELEMENT_TYPES.includes(type)) {
    return {
      valid: false,
      message: `El campo type es obligatorio y debe ser uno de: ${SLIDE_ELEMENT_TYPES.join(', ')}`
    }
  }

  if (content == null || typeof content !== 'object') {
    return {
      valid: false,
      message: 'El campo content es obligatorio y debe ser un objeto JSON válido'
    }
  }

  switch (type) {
    case 'text':
    case 'title':
      if (typeof content.text !== 'string') { // !content.text ||
        return {
          valid: false,
          message: 'Para type "text" o "title", content debe tener la forma: { text: "..." }'
        }
      }
      break
    case 'image':
      if (!content.url || typeof content.url !== 'string') {
        return {
          valid: false,
          message: 'Para type "image", content debe tener la forma: { url: "https://..." }'
        }
      }
      break
    case 'list':
      if (!Array.isArray(content.items) || content.items.some(item => typeof item !== 'string')) {
        return {
          valid: false,
          message: 'Para type "list", content debe tener la forma: { items: ["item1", "item2"] }'
        }
      }
      break
    default:
      return {
        valid: false,
        message: 'Tipo de elemento no válido'
      }
  }

  return { valid: true }
}
