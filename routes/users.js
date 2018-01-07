'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const util = require('./util.js');
const loader = require('../models/sequelize-loader');
const sequelize = loader.database;
const User = require('../models/user');
const Game = require('../models/game');
const Stage = require('../models/stage');
const Favorite = require('../models/favorite');
const Comment = require('../models/comment');
const Like = require('../models/like');

router.get('/:userId', (req, res, next) => {
  if (req.user) {
    Game.findAll({
      include: [{
        model: Stage,
        attributes: ['stageTitle', 'stageContent']
      }, {
        model: Comment,
        attributes: ['comment']
      }],
      where: { createdBy: req.user.id }, // 自分が作ったゲームのみを表示
      order: '"updatedAt" DESC'
    }).then((games) => {
      const gameMap = new Map();
      games.forEach((g) => {
        gameMap.set(g.gameId, g.stages);
      });
      Favorite.findAll({
        where: { userId: req.user.id }
      }).then((favorites) => {
        const favoriteMap = new Map();
        favorites.forEach((f) => {
          favoriteMap.set(f.gameId, f.favorite);
        });
        Like.findAll({
          where: { userId: req.user.id }
        }).then((likes) => {
          const likeMap = new Map();
          likes.forEach((l) => {
            likeMap.set(l.gameId, l.likeState);
          });
          Like.findAll({
            attributes: ['gameId', [sequelize.fn('COUNT', sequelize.col('userId')), 'count']],
            group: ['gameId'],
            where: {
              likeState: 1 // いいね！されたものだけ
            }
          }).then((likes) => {
            const likeCountMap = new Map();
            likes.forEach((l) => {
              likeCountMap.set(l.gameId, l.dataValues['count']); // l.countではundefined
              console.log(likeCountMap);
            });
            res.render('user', {
              user: req.user,
              games: games,
              gameMap: gameMap,
              favoriteMap: favoriteMap,
              likeMap: likeMap,
              likeCountMap: likeCountMap
            });
          });
        });
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
    console.log(favorite);
  });
});

module.exports = router;