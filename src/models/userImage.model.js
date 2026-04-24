import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const UserImage = sequelize.define('UserImage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    lastAccessedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_images',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['userId', 'lastAccessedAt'] }
    ]
  })

  return UserImage
}
