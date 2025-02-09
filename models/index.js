const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const config = require("./../config/database")[
  process.env.NODE_ENV || "development"
];

const sequelize = new Sequelize(config);
const models = {};

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== "index.js" && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file));
    models[model.name] = model.init(sequelize);
  });

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
