'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Post = loader.database.define('posts', {
  postId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  postContent: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  trackingCookie: {
    type: Sequelize.STRING,
    allowNull: false
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false
  },
  gameId: {
    type: Sequelize.UUID,
    allowNull: false
  },
  createdBy: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        fields: ['gameId']
      }
    ]
  });

module.exports = Post;