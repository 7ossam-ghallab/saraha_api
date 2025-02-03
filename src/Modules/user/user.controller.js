import { Router } from "express";
import * as userServices from "./services/user.service.js"

const userRouter = Router();
userRouter.get("/getProfileData/:_id", userServices.profileData);

export default userRouter;