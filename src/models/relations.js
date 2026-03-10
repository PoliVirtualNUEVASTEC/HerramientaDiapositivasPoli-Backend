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
  foreignKey: 'user_id',
  as: 'password_reset_tokens'
})

PasswordResetToken.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
})

// User -> Presentation
User.hasMany(Presentation, {
  foreignKey: 'user_id',
  as: 'presentations'
})

Presentation.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
})

// Presentation -> Slide
Presentation.hasMany(Slide, {
  foreignKey: 'presentation_id',
  as: 'slides'
})

Slide.belongsTo(Presentation, {
  foreignKey: 'presentation_id',
  as: 'presentation'
})

// Slide -> SlideImage
Slide.hasMany(SlideImage, {
  foreignKey: 'slide_id',
  as: 'slide_images'
})

SlideImage.belongsTo(Slide, {
  foreignKey: 'slide_id',
  as: 'slide'
})
