require("dotenv").config();

const models = require("../../models");

const setupTestDB = () => {
  beforeAll(async () => {
    await models.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await models.sequelize.close();
  });

  afterEach(async () => {
    await Promise.all(
      Object.values(models).map((model) => {
        if (model.destroy) {
          return model.destroy({
            where: {},
            force: true,
          });
        }
      })
    );
  });
};

module.exports = setupTestDB;
