'use strict';
const express = require('express');
const router = express.Router();
const util = require('./util.js');
const loader = require('../models/sequelize-loader');
const sequelize = loader.database;
const User = require('../models/user');
const Game = require('../models/game');
const Stage = require('../models/stage');
const Favorite = require('../models/favorite');
const Comment = require('../models/comment');
const Like = require('../models/like');

router.get('/users/:userId', (req, res, next) => {
  const gameMap = new Map();
  const favoriteMap = new Map();
  const likeMap = new Map();
  const likeCountMap = new Map();
  let storedGames = null;
  if (req.user) {
    Game.findAll({
      include: [{
        model: Stage,
        attributes: ['stageTitle', 'stageContent']
      }, {
        model: Comment,
        attributes: ['comment']
      }],
      where: {
        privacy: 'public',
        createdBy: req.params.userId // そのユーザーの公開ゲームのみ
      },
      order: '"updatedAt" DESC'
    }).then((games) => {
      storedGames = games;
      util.createGameMap(games, gameMap);
      return Favorite.findAll({
        where: { userId: req.user.id }
      });
    }).then((favorites) => {
      util.createFavoriteMap(favorites, favoriteMap)
      return Like.findAll({
        where: { userId: req.user.id }
      });
    }).then((likes) => {
      util.createLikeMap(likes, likeMap);
      return Like.findAll({
        attributes: ['gameId', [sequelize.fn('COUNT', sequelize.col('userId')), 'count']],
        group: ['gameId'],
        where: { likeState: 1 }
      });
    }).then((likeCount) => {
      util.createLikeCountMap(likeCount, likeCountMap);
      return User.findOne({
        where: { userId: req.params.userId },
      });
    }).then((others) => {
      res.render('others', {
        user: req.user,
        games: storedGames,
        gameMap: gameMap,
        favoriteMap: favoriteMap,
        likeMap: likeMap,
        likeCountMap: likeCountMap,
        others: others
      });
    });
  } else {
    Game.findAll({
      include: [{
        model: Stage,
        attributes: ['stageTitle', 'stageContent']
      }, {
        model: Comment,
        attributes: ['comment']
      }],
      where: {
        privacy: 'public',
        createdBy: req.params.userId
      },
      order: '"updatedAt" DESC'
    }).then((games) => {
      storedGames = games
      util.createGameMap(games, gameMap);
      return Like.findAll({
        attributes: ['gameId', [sequelize.fn('COUNT', sequelize.col('userId')), 'count']],
        group: ['gameId'],
        where: { likeState: 1 }
      });
    }).then((likeCount) => {
      util.createLikeCountMap(likeCount, likeCountMap);
      return User.findOne({
        where: { userId: req.params.userId },
      });
    }).then((others) => {
      res.render('others', {
        user: req.user,
        games: storedGames,
        gameMap: gameMap,
        likeCountMap: likeCountMap,
        others: others
      });
    });
  }
});

module.exports = router;