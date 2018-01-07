'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Like = loader.database.define('likes', {
  gameId: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false
  },
  like: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        fields: ['like']
      }
    ]
  });

module.exports = Like;