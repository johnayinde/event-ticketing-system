require("dotenv").config();

const rateLimit = require("express-rate-limit");

/**
 *Per IP address => 15 requests per minute
 */

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: process.env.NODE_ENV === "test" ? 50 : 15,
  message: {
    error: "Too many requests",
    message: "Please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = limiter;
