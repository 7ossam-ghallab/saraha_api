import Joi from "joi";

const sendMessageValidationSchema = {
  body: Joi.object({
    body: Joi.string().min(1).max(1000).required(),
    ownerId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({ "string.pattern.base": "Invalid ownerId format" }),
  }),
};

export default sendMessageValidationSchema;