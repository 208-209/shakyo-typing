'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Game = loader.database.define('games', {
  gameId: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false
  },
  gameName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  tags: {
    type: Sequelize.STRING,
    allowNull: false
  },
  privacy: {
    type: Sequelize.STRING,
    allowNull: false
  },
  createdBy: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
    freezeTableName: true,
    timestamps: true,
    indexes: [
      {
        fields: ['createdBy', 'privacy']
      }
    ]
  });

module.exports = Game;