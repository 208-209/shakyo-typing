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

// ブックマーク登録したゲーム一覧
router.get('/:userId/favorites', authenticationEnsurer , (req, res, next) => {
  const favoriteMap = new Map();
  const likeMap = new Map();
  const likeCountMap = new Map();
  let storedGames = null;
  if (req.user) {
    Game.findAll({
      include: [{
        model: Favorite,
        attributes: ['favorite'],
        where: {
          userId: req.user.id,
          favorite: 1 // ブックマーク登録したゲーム
        }
      }, {
        model: Comment,
        attributes: ['commentId']
      }],
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
      res.render('favorite', {
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

router.post('/:userId/games/:gemeId/favorite', authenticationEnsurer, (req, res, next) => {
  const gameId = req.params.gemeId;
  const userId = req.params.userId;
  let favorite = req.body.favorite;
  favorite = favorite ? parseInt(favorite) : 0;

  Favorite.upsert({
    userId: userId,
    gameId: gameId,
    favorite: favorite
  }).then(() => {
    res.json({ status: 'OK', favorite: favorite });
  });
});

module.exports = router;