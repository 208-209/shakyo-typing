'use strict';
const express = require('express');
const router = express.Router();
const util = require('./util.js');
const User = require('../models/user');
const Game = require('../models/game');
const Stage = require('../models/stage');
const Favorite = require('../models/favorite');
const Comment = require('../models/comment');
const Like = require('../models/like');

router.get('/', (req, res, next) => {
  if (req.user) {
    Game.findAll({
      include: [{
        model: Stage,
        attributes: ['stageTitle', 'stageContent']
      }, {
        model: Comment,
        attributes: ['comment']
      }],
      where: { privacy: 'public' }, // 公開ゲームのみを表示
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
            likeMap.set(l.gameId, l.like);
          });
          res.render('index', {
            user: req.user,
            games: games,
            gameMap: gameMap,
            favoriteMap: favoriteMap,
            likeMap: likeMap
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
      where: { privacy: 'public' },
      order: '"updatedAt" DESC'
    }).then((games) => {
      const gameMap = new Map();
      games.forEach((g) => {
        gameMap.set(g.gameId, g.stages);
      });
      res.render('index', {
        user: req.user,
        games: games,
        gameMap: gameMap
      });
    });
  }
});

module.exports = router;