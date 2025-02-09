const rateLimit = require("express-rate-limit");

/**
 *Per IP address => 20 requests per minute
 */
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: {
    error: "Too many requests",
    message: "Please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = limiter;
