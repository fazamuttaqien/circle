import * as Joi from "joi";

export const addthread = Joi.object({
  content: Joi.string().required(),
  image: Joi.allow(""),
});
