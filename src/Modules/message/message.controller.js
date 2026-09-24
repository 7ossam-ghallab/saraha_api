import { Router } from "express";
import * as messageServices from "./services/message.service.js";
import { errorHandler } from "../../Middlewares/errorHandler.middlewares.js";
import { authenticationMiddleware } from "../../Middlewares/authentication.middlewares.js";
import { autherization } from "../../Middlewares/autherization.middlewares.js";
import { systemRoles } from "../../Constants/systemRoles.constants.js";
import validationMiddleware from "../../Middlewares/validation.middleware.js";
import sendMessageValidationSchema from "../../validators/sendMessage.schema.js";
import messageParamsValidationSchema from "../../validators/messageParams.schema.js";
import paginationQuerySchema from "../../validators/pagination.schema.js";

const { ADMIN, SUPER_ADMIN } = systemRoles;

const messagesRouter = Router();

messagesRouter.post(
  "/send",
  validationMiddleware(sendMessageValidationSchema),
  errorHandler(messageServices.sendMessage)
);
messagesRouter.get(
  "/getMessages",
  authenticationMiddleware(),
  autherization([ADMIN, SUPER_ADMIN]),
  validationMiddleware({ query: paginationQuerySchema }),
  errorHandler(messageServices.getMessages)
);
messagesRouter.get(
  "/getUserMessages",
  authenticationMiddleware(),
  validationMiddleware({ query: paginationQuerySchema }),
  errorHandler(messageServices.getUserMessages)
);
messagesRouter.delete(
  "/:id",
  authenticationMiddleware(),
  validationMiddleware(messageParamsValidationSchema),
  errorHandler(messageServices.deleteMessage)
);

export default messagesRouter;