const Sequelize = require("sequelize");
const config =
  require("../config/database")[process.env.NODE_ENV || "development"];

const sequelize = new Sequelize(config);
const models = {};

const Event = require("./Event");
const Ticket = require("./Ticket");
const WaitingList = require("./WaitingList");
const User = require("./User");

models.Event = Event.init(sequelize);
models.Ticket = Ticket.init(sequelize);
models.WaitingList = WaitingList.init(sequelize);
models.User = User.init(sequelize);

Object.values(models)
  .filter((model) => typeof model.associate === "function")
  .forEach((model) => model.associate(models));

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
