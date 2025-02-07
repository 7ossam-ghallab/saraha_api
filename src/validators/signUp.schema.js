import Joi from "joi";
const signUpValidationSchema = {
  body : Joi.object({
    username : Joi.string().min(3).max(20).required(),
    email : Joi.string().email().required(),
    password : Joi.string().min(8).required(),
    confirmPassword : Joi.string().valid(Joi.ref('password')).required(),
    phone : Joi.string().min(10).max(15).required(),
  })
}

export default signUpValidationSchema;