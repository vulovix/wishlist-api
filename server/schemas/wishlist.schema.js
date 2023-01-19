const Joi = require("joi");

module.exports = {
  urlIdentificator: Joi.object().keys({
    id: Joi.string().required(),
  }),
  create: Joi.object().keys({
    url: Joi.string().required(),
    title: Joi.string().required(),
    image: Joi.string().required(),
  }),
  fetch: Joi.object().keys({
    url: Joi.string().uri().required(),
  }),
  update: Joi.object().keys({
    url: Joi.string().required(),
    title: Joi.string().required(),
    image: Joi.string().required(),
  }),
};
