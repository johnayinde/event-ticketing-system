const { Model, DataTypes } = require("sequelize");

class WaitingList extends Model {
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
        position: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
      },
      {
        sequelize,
        modelName: "WaitingList",
        tableName: "waiting_lists",
        indexes: [{ fields: ["eventId"] }, { fields: ["position"] }],
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Event, {
      foreignKey: "eventId",
    });
  }
}

module.exports = WaitingList;
