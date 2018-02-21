'use strict';
const express = require('express');
const router = express.Router();
const util = require('./util.js');
const loader = require('../models/sequelize-loader');
const sequelize = loader.database;
const Game = require('../models/game');
const Stage = require('../models/stage');
const Favorite = require('../models/favorite');
const Comment = require('../models/comment');
const Like = require('../models/like');

// タグゲーム一覧
router.get('/tags/:tag', (req, res, next) => {
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
      where: {
        privacy: 1,
        tags: { $like: req.params.tag } // タグの文字を含む
      },
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
      res.render('tag', {
        user: req.user,
        games: storedGames,
        favoriteMap: favoriteMap,
        likeMap: likeMap,
        likeCountMap: likeCountMap
      });
    });
  } else {
    Game.findAll({
      include: [{
        model: Comment,
        attributes: ['commentId']
      }],
      where: {
        privacy: 1,
        tags: { $like: '%' + req.params.tag + '%' } // タグの文字を含む
      },
      order: '"updatedAt" DESC'
    }).then((games) => {
      storedGames = games
      return Like.findAll({
        attributes: ['gameId', [sequelize.fn('COUNT', sequelize.col('userId')), 'count']],
        group: ['gameId'],
        where: { likeState: 1 }
      });
    }).then((likeCount) => {
      util.createLikeCountMap(likeCount, likeCountMap);
      res.render('tag', {
        user: req.user,
        games: storedGames,
        likeCountMap: likeCountMap
      });
    });
  }
});

module.exports = router;