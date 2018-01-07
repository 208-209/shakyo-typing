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

router.get('/:userId/favorites', (req, res, next) => {
  if (req.user) {
    Game.findAll({
      include: [{
        model: Stage,
        attributes: ['stageTitle', 'stageContent']
      }, {
        model: Favorite,
        attributes: ['favorite'],
        where: {
          userId: req.user.id,
          favorite: 1 // お気に入り登録したゲームのみを表示
        }
      }, {
        model: Comment,
        attributes: ['comment']
      }],
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
            res.render('favorite', {
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

module.exports = router;