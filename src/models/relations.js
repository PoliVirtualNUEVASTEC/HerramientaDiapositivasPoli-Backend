import UserModel from './user.model.js'
import PasswordResetTokenModel from './passwordResetToken.model.js'
import PresentationModel from './presentation.model.js'
import SlideModel from './slide.model.js'
import SlideElementModel from './slideElement.model.js'

import { sequelize } from '../db/database.js'

export const User = UserModel(sequelize)
export const PasswordResetToken = PasswordResetTokenModel(sequelize)
export const Presentation = PresentationModel(sequelize)
export const Slide = SlideModel(sequelize)
export const SlideElement = SlideElementModel(sequelize)

User.hasMany(Presentation, { foreignKey: 'userId' })
Presentation.belongsTo(User, { foreignKey: 'userId' })

User.hasMany(PasswordResetToken, { foreignKey: 'userId' })
PasswordResetToken.belongsTo(User, { foreignKey: 'userId' })

// Presentation
Presentation.hasMany(Slide, { foreignKey: 'presentationId', onDelete: 'CASCADE' })
Slide.belongsTo(Presentation, { foreignKey: 'presentationId' })

// Slide
Slide.hasMany(SlideElement, { foreignKey: 'slideId', onDelete: 'CASCADE' })
SlideElement.belongsTo(Slide, { foreignKey: 'slideId' })
