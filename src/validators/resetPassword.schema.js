import Joi from "joi";

const resetPasswordValidationSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().pattern(/^\d{6}$/).required().messages({
      "string.pattern.base": "OTP must be a 6-digit number",
    }),
    password: Joi.string().min(8).max(100).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
      "any.only": "Passwords do not match",
    }),
  }),
};

export default resetPasswordValidationSchema;