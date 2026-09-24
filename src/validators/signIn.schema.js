import Joi from "joi";

const signInValidationSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(100).required(),
  }),
};

export default signInValidationSchema;