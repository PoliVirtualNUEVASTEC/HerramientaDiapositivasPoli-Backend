import { app } from './app.js'
import './models/relations.js'
import { sequelize } from './db/database.js'

try {
  await sequelize.authenticate()
  console.log('Conexión a Supabase exitosa')

  // await sequelize.sync({ force: true })
  // console.log('Database synchronized')

  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log('app listen in port 3000')
  })
} catch (error) {
  console.error('Error conectando a la base de datos:', error)
}
