import Joi from "joi";

const updateProfileValidationSchema = {
  body: Joi.object({
    userName: Joi.string().min(3).max(20),
    email: Joi.string().email(),
    phone: Joi.string().min(10).max(15),
  }).min(1),
};

export default updateProfileValidationSchema;