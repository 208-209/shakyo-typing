'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Comment = loader.database.define('comments', {
  commentId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  comment: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  trackingCookie: {
    type: Sequelize.STRING,
    allowNull: false
  },
  gameId: {
    type: Sequelize.UUID,
    allowNull: false
  },
  postedBy: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
    freezeTableName: true,
    timestamps: true,
    indexes: [
      {
        fields: ['gameId']
      }
    ]
  });

module.exports = Comment;