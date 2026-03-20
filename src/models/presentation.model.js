// models/Presentation.js
import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const Presentation = sequelize.define('Presentation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    theme: {
      type: DataTypes.JSONB
    },
    fontFamily: {
      type: DataTypes.STRING,
      defaultValue: 'Arial'
    },
    primaryColor: {
      type: DataTypes.STRING,
      defaultValue: '#000000'
    }
  }, {
    timestamps: true
  })

  return Presentation
}
