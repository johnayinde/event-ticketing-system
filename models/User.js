const { Model, DataTypes } = require("sequelize");

class User extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        identifier: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
      },
      {
        sequelize,
        modelName: "User",
        tableName: "users",
      }
    );
  }

  static associate(models) {
    this.hasMany(models.Ticket, { foreignKey: "userId" });
    this.hasMany(models.WaitingList, { foreignKey: "userId" });
  }
}
module.exports = User;
