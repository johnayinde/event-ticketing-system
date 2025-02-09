"use strict";

var Sequelize = require("sequelize");

/**
 * Actions summary:
 *
 * createTable "events", deps: []
 * createTable "tickets", deps: []
 * createTable "users", deps: []
 * createTable "waiting_lists", deps: []
 * addIndex "tickets_event_id" to table "tickets"
 * addIndex "tickets_user_id" to table "tickets"
 * addIndex "tickets_status" to table "tickets"
 * addIndex "waiting_lists_event_id" to table "waiting_lists"
 * addIndex "waiting_lists_position" to table "waiting_lists"
 *
 **/

var info = {
  revision: 1,
  name: "create-tables",
  created: "2025-02-09T14:19:04.651Z",
  comment: "",
};

var migrationCommands = [
  {
    fn: "createTable",
    params: [
      "events",
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        totalTickets: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        availableTickets: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM("DRAFT", "PUBLISHED", "CANCELLED"),
          defaultValue: "DRAFT",
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "users",
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        identifier: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "tickets",
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        eventId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "events",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        userId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        status: {
          type: Sequelize.ENUM("BOOKED", "CANCELLED"),
          defaultValue: "BOOKED",
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {},
    ],
  },
  {
    fn: "createTable",
    params: [
      "waiting_lists",
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        eventId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "events",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        userId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        position: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {},
    ],
  },
];

module.exports = {
  pos: 0,
  up: function (queryInterface, Sequelize) {
    var index = this.pos;
    return new Promise(function (resolve, reject) {
      function next() {
        if (index < migrationCommands.length) {
          let command = migrationCommands[index];
          console.log("[#" + index + "] execute: " + command.fn);
          index++;
          queryInterface[command.fn]
            .apply(queryInterface, command.params)
            .then(next, reject);
        } else resolve();
      }
      next();
    });
  },
  info: info,
};
