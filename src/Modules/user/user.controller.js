import { Router } from "express";
import * as userServices from "./services/user.service.js"
import { authenticationMiddleware } from "../../Middlewares/authentication.middlewares.js";
import { autherization } from "../../Middlewares/autherization.middlewares.js";
import { systemRoles } from "../../Constants/systemRoles.constants.js";
import { errorHandler } from "../../Middlewares/errorHandler.middlewares.js";
const { USER , ADMIN, SUPER_ADMIN} = systemRoles


const userRouter = Router();
userRouter.use(authenticationMiddleware())

userRouter.get("/getProfileData", errorHandler(userServices.profileData));
userRouter.patch("/update-password", errorHandler(userServices.updatePassword));
userRouter.put("/update-profile", errorHandler(userServices.updateProfile));
userRouter.get("/list-users", autherization([ USER, ADMIN]) ,errorHandler(userServices.listUsers));

export default userRouter;