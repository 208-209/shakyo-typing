'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Like = loader.database.define('likes', {
  userId: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false
  },
  gameId: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false
  },
  likeState: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        fields: ['likeState']
      }
    ]
  });

module.exports = Like;