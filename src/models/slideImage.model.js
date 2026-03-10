// models/SlideImage.js
import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const SlideImage = sequelize.define('SlideImage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    slideId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamps: true
  })

  return SlideImage
}
