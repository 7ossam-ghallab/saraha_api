import Joi from "joi";

const updatePasswordValidationSchema = {
  body: Joi.object({
    oldPassword: Joi.string().min(8).max(100).required(),
    newPassword: Joi.string().min(8).max(100).required(),
    confirmNewPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .messages({ "any.only": "New passwords do not match" }),
  }),
};

export default updatePasswordValidationSchema;