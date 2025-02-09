const { Model, DataTypes } = require("sequelize");

class Ticket extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        eventId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "events",
            key: "id",
          },
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM("BOOKED", "CANCELLED"),
          defaultValue: "BOOKED",
        },
      },
      {
        sequelize,
        modelName: "Ticket",
        tableName: "tickets",
        indexes: [
          { fields: ["eventId"] },
          { fields: ["userId"] },
          { fields: ["status"] },
        ],
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Event, {
      foreignKey: "eventId",
    });
    this.belongsTo(models.User, { foreignKey: "userId" });
  }
}

module.exports = Ticket;
