import { Sequelize } from 'sequelize'
const URl = process.env.DATABASE_URL
export const sequelize = new Sequelize(URl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  }
})
