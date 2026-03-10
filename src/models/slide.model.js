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
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    slideOrder: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    timestamps: true
  })

  return Slide
}
