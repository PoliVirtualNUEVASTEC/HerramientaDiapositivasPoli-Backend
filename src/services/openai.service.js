import OpenAI from 'openai'
import presentationSchema from '../schemas/presentation.schema.js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function generatePresentationWithAI ({
  text,
  title = 'Presentación generada automáticamente',
  numberOfSlides = 6
}) {
  const systemPrompt = `
Eres un generador experto de presentaciones educativas.

Debes transformar el texto entregado por el usuario en una presentación JSON compatible con un frontend de renderizado de diapositivas.

Reglas obligatorias:

1. Devuelve únicamente JSON siguiendo el esquema.
2. No inventes URLs de imágenes.
3. No incluyas el campo background en las diapositivas.
4. Los fondos serán asignados después por el backend.
5. Usa un lienzo base de 960 x 540 px.
6. Todas las posiciones deben estar dentro del lienzo.
7. Evita superponer elementos.
8. Usa márgenes mínimos de 40 px.
9. Procura realizar diaposotivas esteticamente atractivas, al momento de organizar los elementos que la disposición sea agradable y respete estándares de diseño de diapositivas modernas.
10. Crea una portada, varias diapositivas de contenido y una diapositiva final.
11. Cada diapositiva debe tener máximo 4 elementos. (priorisa el título, un texto o lista según el contenido, y una imagen relacioanda al contenido)
12. Los textos deben ser breves, claros y adecuados para una presentación visual. procura buscar al menos 1 imagen por diapositiva 
13. Cuando uses imágenes, no devuelvas URL. Devuelve una intención de búsqueda con esta estructura:
   {
     "query": "...",
     "style": "...",
     "orientation": "horizontal"
   }
14. Las consultas de imágenes deben estar preferiblemente en inglés para mejorar los resultados en bancos de imágenes.
15. Si el texto es muy largo, sintetiza y organiza por temas.
16. Si el contenido es académico, usa tono formal, claro y pedagógico.
17. La presentación debe tener aproximadamente ${numberOfSlides} diapositivas.
18. El idioma de salida de la presentación tiene que estar en el mismo idioma que el texto de entrada.
`

  const userPrompt = `
Título sugerido: ${title}

Texto base para generar la presentación:

${text}
`

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    input: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'presentation_json',
        strict: true,
        schema: presentationSchema
      }
    }
  })

  const rawJson = response.output_text

  if (!rawJson) {
    throw new Error('OpenAI no devolvió contenido JSON.')
  }

  return JSON.parse(rawJson)
}
