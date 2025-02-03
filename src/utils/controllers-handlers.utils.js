import userRouter from '../Modules/user/user.controller.js'
import authRouter from '../Modules/auth/auth.controller.js'

export const controllerHandler = (app) => {
  app.use('/auth', authRouter)
  app.use('/user', userRouter)
}