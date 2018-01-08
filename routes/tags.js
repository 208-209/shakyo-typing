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

router.get('/:tag', (req, res, next) => {
  const tag = req.params.tag;
  if (req.user) {
    Game.findAll({
      include: [{
        model: Stage,
        attributes: ['stageTitle', 'stageContent']
      }, {
        model: Comment,
        attributes: ['comment']
      }],
      where: { tags: { $like: '%' + req.params.tag + '%' } }, // タグ
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
            res.render('tag', {
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
    Game.findAll({
      include: [{
        model: Stage,
        attributes: ['stageTitle', 'stageContent']
      }, {
        model: Comment,
        attributes: ['comment']
      }],
      where: { tags: { $like: '%' + req.params.tag + '%' } },
      order: '"updatedAt" DESC'
    }).then((games) => {
      const gameMap = new Map();
      games.forEach((g) => {
        gameMap.set(g.gameId, g.stages);
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
        res.render('tag', {
          user: req.user,
          games: games,
          gameMap: gameMap,
          likeCountMap: likeCountMap
        });
      });
    });
  }
});

module.exports = router;