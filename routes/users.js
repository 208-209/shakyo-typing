'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const util = require('./util.js');
const loader = require('../models/sequelize-loader');
const sequelize = loader.database;
const Game = require('../models/game');
const Stage = require('../models/stage');
const Favorite = require('../models/favorite');
const Comment = require('../models/comment');
const Like = require('../models/like');

// ログインユーザーのゲーム一覧
router.get('/:userId', authenticationEnsurer, (req, res, next) => {
  const favoriteMap = new Map();
  const likeMap = new Map();
  const likeCountMap = new Map();
  let storedGames = null;
  if (req.user) {
    Game.findAll({
      include: [{
        model: Comment,
        attributes: ['commentId']
      }],
      where: { createdBy: req.user.id }, // 作成者が自分自身
      order: '"updatedAt" DESC'
    }).then((games) => {
      storedGames = games;
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
      res.render('user', {
        user: req.user,
        games: storedGames,
        favoriteMap: favoriteMap,
        likeMap: likeMap,
        likeCountMap: likeCountMap
      });
    });
  } else {
    const err = new Error('指定されたゲームがない、または、権限がありません');
    err.status = 404;
    next(err);
  }
});

module.exports = router;