'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Favorite = loader.database.define('favorites', {
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
  favorite: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        fields: ['gameId', 'favorite']
      }
    ]
  });

module.exports = Favorite;