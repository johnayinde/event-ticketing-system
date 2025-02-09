const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const routes = require("./routes");
const { errorHandler, requestLogger, rateLimiter } = require("./middlewares");
const models = require("./models");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(rateLimiter);

app.use("/", routes(models));
app.use(errorHandler);

module.exports = app;
