import {Router} from 'express'
import * as authServices from './services/auth.services.js'

const authRouter = Router()

authRouter.post('/signup', authServices.signUp)
authRouter.post('/signin', authServices.signIn)

export default authRouter;