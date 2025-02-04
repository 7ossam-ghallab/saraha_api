import { Router } from "express";
import * as userServices from "./services/user.service.js"

const userRouter = Router();
userRouter.get("/getProfileData", userServices.profileData);

export default userRouter;