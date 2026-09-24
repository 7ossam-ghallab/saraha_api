import Joi from "joi";

const forgotPasswordValidationSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};

export default forgotPasswordValidationSchema;