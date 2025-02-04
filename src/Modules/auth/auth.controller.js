import {Router} from 'express'
import * as authServices from './services/auth.services.js'

const authRouter = Router()

authRouter.post('/signup', authServices.signUp)
authRouter.post('/signin', authServices.signIn)
authRouter.get('/verify-email/:token', authServices.verifyEmail)
authRouter.get('/refresh-token', authServices.refreshToken)
authRouter.get('/logout', authServices.logOut)
authRouter.put('/forgot-password', authServices.forgotPassword)
authRouter.put('/reset-password', authServices.resetPassword)

export default authRouter;