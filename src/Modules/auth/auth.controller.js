import {Router} from 'express'
import * as authServices from './services/auth.services.js'

const authRouter = Router()

authRouter.post('/signup', authServices.signUp)
authRouter.post('/signin', authServices.signIn)
authRouter.post('/logout', authServices.logOut)
authRouter.get('/verify-email/:token', authServices.verifyEmail)
authRouter.post('/refresh-token', authServices.refreshToken)
authRouter.patch('/forgot-password', authServices.forgotPassword)
authRouter.put('/reset-password', authServices.resetPassword)

export default authRouter;