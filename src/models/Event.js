const { Model, DataTypes } = require("sequelize");

class Event extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        totalTickets: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 1,
          },
        },
        availableTickets: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM("DRAFT", "PUBLISHED", "CANCELLED"),
          defaultValue: "DRAFT",
        },
      },
      {
        sequelize,
        modelName: "Event",
        tableName: "events",
      }
    );
  }

  static associate(models) {
    this.hasMany(models.Ticket, {
      foreignKey: "eventId",
      onDelete: "CASCADE",
    });
    this.hasMany(models.WaitingList, {
      foreignKey: "eventId",
      onDelete: "CASCADE",
    });
  }
}

module.exports = Event;
