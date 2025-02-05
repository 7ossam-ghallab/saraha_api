import { Router } from "express";
import * as messageServices from "./services/message.service.js"
import { errorHandler } from "../../Middlewares/errorHandler.middlewares.js";
import { authenticationMiddleware } from "../../Middlewares/authentication.middlewares.js";


const messagesRouter = Router();

messagesRouter.post("/send", errorHandler(messageServices.sendMessage));
messagesRouter.get("/getMessages", errorHandler(messageServices.getMessages));
messagesRouter.get("/getUserMessages", authenticationMiddleware() ,errorHandler(messageServices.getUserMessages));

export default messagesRouter;