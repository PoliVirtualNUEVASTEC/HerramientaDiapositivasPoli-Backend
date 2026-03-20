// models/Slide.js
import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const Slide = sequelize.define('Slide', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    presentationId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING
    },
    slideOrder: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    background: {
      type: DataTypes.JSONB // color, gradiente o imagen
    }
  }, {
    timestamps: true
  })

  return Slide
}
