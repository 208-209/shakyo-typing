'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Stage = loader.database.define('stages', {
  stageId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  stageTitle: {
    type: Sequelize.STRING,
    allowNull: false
  },
  stageContent: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  createdBy: {
    type: Sequelize.STRING,
    allowNull: false
  },
  gameId: {
    type: Sequelize.UUID,
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

module.exports = Stage;