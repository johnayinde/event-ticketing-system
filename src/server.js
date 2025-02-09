require("dotenv").config();
const app = require("./app");
const models = require("./models");
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // await models.sequelize.sync();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
