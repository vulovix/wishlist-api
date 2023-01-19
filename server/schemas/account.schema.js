const Joi = require("joi");

module.exports = {
  login: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  register: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
  }),
  update: Joi.object().keys({
    firstName: Joi.string().allow(['']),
    lastName: Joi.string().allow(['']),
  }),
}