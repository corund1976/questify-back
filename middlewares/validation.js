const Joi = require("joi");

function userValidation(req, res, next) {
  const schema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    subscription: Joi.string(),
    token: Joi.string(),
  });

  const validationResult = schema.validate(req.body);

  if (validationResult.error) {
    return res.status(400).json({ message: validationResult.error.details });
  }

  next();
};

function todoValidation(req, res, next) {
  const schema = Joi.object({
    title: Joi.string()
      .regex(/^[a-zA-Zа-яА-Яіїє' ]*$/)
      .min(2)
      .max(30)
      .required(),
    category: Joi.string().required(),
    type: Joi.string().required(),
    time: Joi.date().required(),
    isActive: Joi.boolean(),
    level: Joi.string().required(),
  });

  const validationResult = schema.validate(req.body);

  if (validationResult.error) {
    return res.status(400).json({ message: validationResult.error.details });
  }

  next();
}

module.exports = { userValidation, todoValidation }