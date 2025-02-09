const Joi = require("joi");

const schemas = {
  eventInitialize: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    totalTickets: Joi.number().integer().min(1).required(),
  }),

  bookTicket: Joi.object({
    eventId: Joi.string().uuid().required(),
    identifier: Joi.string().required(),
    quantity: Joi.number().integer().min(1).default(1),
  }),

  cancelTicket: Joi.object({
    eventId: Joi.string().uuid().required(),
    identifier: Joi.string().required(),
  }),
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation Error",
        details: error.details.map((err) => ({
          message: err.message,
          field: err.path[0],
        })),
      });
    }
    next();
  };
};

module.exports = {
  validate,
  schemas,
};
