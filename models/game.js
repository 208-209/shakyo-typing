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
  tab: {
    type: Sequelize.STRING,
    allowNull: false
  },
  private: {
    type: Sequelize.INTEGER,
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
        fields: ['createdBy']
      }
    ]
  });

module.exports = Game;