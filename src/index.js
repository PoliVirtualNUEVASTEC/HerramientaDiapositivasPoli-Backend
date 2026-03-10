import { app } from './app.js'

try {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log('app listen in port 3000')
  })
} catch (error) {
  console.error('error running the app')
}
