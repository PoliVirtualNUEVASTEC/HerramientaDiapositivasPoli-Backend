// models/SlideElement.js
import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const SlideElement = sequelize.define('SlideElement', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    slideId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('text', 'title', 'image', 'list'),
      allowNull: false
    },
    content: {
      type: DataTypes.JSONB, // texto, url, etc
      allowNull: false
    },
    positionX: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    positionY: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    width: {
      type: DataTypes.FLOAT,
      defaultValue: 100
    },
    height: {
      type: DataTypes.FLOAT,
      defaultValue: 50
    },
    styles: {
      type: DataTypes.JSONB // fontSize, color, etc
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    timestamps: true
  })

  return SlideElement
}
