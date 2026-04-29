import { app } from './app.js'
import './models/relations.js'
import { sequelize } from './db/database.js'
import { runUserImageMaintenance, startUserImageMaintenance } from './services/userImage.service.js'

try {
  await sequelize.authenticate()
  console.log('Conexion a Supabase exitosa')

  // await UserImage.sync({ alter: true })
  await runUserImageMaintenance()
  startUserImageMaintenance()

  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`app listen in port ${PORT}`)
  })
} catch (error) {
  console.error('Error conectando a la base de datos:', error)
}
