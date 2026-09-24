import { Router } from "express";
import * as authServices from "./services/auth.services.js";
import validationMiddleware from "../../Middlewares/validation.middleware.js";
import signUpValidationSchema from "../../validators/signUp.schema.js";
import signInValidationSchema from "../../validators/signIn.schema.js";
import forgotPasswordValidationSchema from "../../validators/forgotPassword.schema.js";
import resetPasswordValidationSchema from "../../validators/resetPassword.schema.js";

const authRouter = Router();

authRouter.post("/signup", validationMiddleware(signUpValidationSchema), authServices.signUp);
authRouter.post("/signin", validationMiddleware(signInValidationSchema), authServices.signIn);
authRouter.post("/logout", authServices.logOut);
authRouter.get("/verify-email/:token", authServices.verifyEmail);
authRouter.post("/refresh-token", authServices.refreshToken);
authRouter.patch("/forgot-password", validationMiddleware(forgotPasswordValidationSchema), authServices.forgotPassword);
authRouter.put("/reset-password", validationMiddleware(resetPasswordValidationSchema), authServices.resetPassword);

export default authRouter;