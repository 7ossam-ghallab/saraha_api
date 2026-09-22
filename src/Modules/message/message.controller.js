import { Router } from "express";
import * as messageServices from "./services/message.service.js"
import { errorHandler } from "../../Middlewares/errorHandler.middlewares.js";
import { authenticationMiddleware } from "../../Middlewares/authentication.middlewares.js";
import { autherization } from "../../Middlewares/autherization.middlewares.js";
import { systemRoles } from "../../Constants/systemRoles.constants.js";

const { ADMIN, SUPER_ADMIN } = systemRoles

const messagesRouter = Router();

messagesRouter.post("/send", errorHandler(messageServices.sendMessage));
messagesRouter.get("/getMessages", authenticationMiddleware(), autherization([ADMIN, SUPER_ADMIN]) ,errorHandler(messageServices.getMessages));
messagesRouter.get("/getUserMessages", authenticationMiddleware() ,errorHandler(messageServices.getUserMessages));

export default messagesRouter;