import { Router } from "express";
import * as userServices from "./services/user.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication.middlewares.js";
import { autherization } from "../../Middlewares/autherization.middlewares.js";
import { systemRoles } from "../../Constants/systemRoles.constants.js";
import { errorHandler } from "../../Middlewares/errorHandler.middlewares.js";
import validationMiddleware from "../../Middlewares/validation.middleware.js";
import updatePasswordValidationSchema from "../../validators/updatePassword.schema.js";
import updateProfileValidationSchema from "../../validators/updateProfile.schema.js";
import paginationQuerySchema from "../../validators/pagination.schema.js";

const { ADMIN, SUPER_ADMIN } = systemRoles;

const userRouter = Router();
userRouter.use(authenticationMiddleware());

userRouter.get("/getProfileData", errorHandler(userServices.profileData));
userRouter.patch(
  "/update-password",
  validationMiddleware(updatePasswordValidationSchema),
  errorHandler(userServices.updatePassword)
);
userRouter.put(
  "/update-profile",
  validationMiddleware(updateProfileValidationSchema),
  errorHandler(userServices.updateProfile)
);
userRouter.get(
  "/list-users",
  autherization([ADMIN, SUPER_ADMIN]),
  validationMiddleware({ query: paginationQuerySchema }),
  errorHandler(userServices.listUsers)
);

export default userRouter;