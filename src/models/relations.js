import UserModel from './user.model.js'
import PasswordResetTokenModel from './passwordResetToken.model.js'
import PresentationModel from './presentation.model.js'
import SlideModel from './slide.model.js'
import SlideImageModel from './slideImage.model.js'

import { sequelize } from '../db/database.js'

export const User = UserModel(sequelize)
export const PasswordResetToken = PasswordResetTokenModel(sequelize)
export const Presentation = PresentationModel(sequelize)
export const Slide = SlideModel(sequelize)
export const SlideImage = SlideImageModel(sequelize)

// User -> PasswordResetToken
User.hasMany(PasswordResetToken, {
  foreignKey: 'userId',
  as: 'password_reset_tokens'
})

PasswordResetToken.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
})

// User -> Presentation
User.hasMany(Presentation, {
  foreignKey: 'userId',
  as: 'presentations'
})

Presentation.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
})

// Presentation -> Slide
Presentation.hasMany(Slide, {
  foreignKey: 'presentationId',
  as: 'slides'
})

Slide.belongsTo(Presentation, {
  foreignKey: 'presentationId',
  as: 'presentation'
})

// Slide -> SlideImage
Slide.hasMany(SlideImage, {
  foreignKey: 'slideId',
  as: 'slide_images'
})

SlideImage.belongsTo(Slide, {
  foreignKey: 'slideId',
  as: 'slide'
})
