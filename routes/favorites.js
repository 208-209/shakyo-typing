'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const User = require('../models/user');
const Game = require('../models/game');
const Stage = require('../models/stage');
const Favorite = require('../models/favorite');

router.get('/:userId/favorites', (req, res, next) => {
  if (req.user) {
    Game.findAll({
      include: [{
        model: Stage,
        attributes: ['stageTitle', 'stageContent']
      }, {
        model: Favorite,
        attributes: ['gameId', 'favorite', 'favorite'],
        where: {
          userId: req.user.id,
          favorite: 1
        }
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
        console.log(games);
        res.render('index', {
          user: req.user,
          games: games,
          gameMap: gameMap,
          favoriteMap: favoriteMap
        });
      });
    });
  } else {
    const err = new Error('指定されたゲームがない、または、権限がありません');
    err.status = 404;
    next(err);
  }
});


/*
router.get('/users/:userId/favorites', authenticationEnsurer, (req, res, next) => {
  if (req.user) {
    Game.findAll({
      include: [{
        model: Stage,
        attributes: ['stageTitle', 'stageContent']
      },{
        model: Favorite,
        attributes: ['stageTitle', 'stageContent']
      }],
      where: {
        userId: req.user.id,
        favorite: 1
      },
      order: '"updatedAt" DESC'
    }).then((games) => {
      Favorite.findAll({
        where: {
          userId: req.user.id
        }
      }).then((favorites) => {
        const favoriteMap = new Map();
        favorites.forEach((f) => {
          favoriteMap.set(f.gameId, f.favorite);
        });
        const gameMap = new Map();
        games.forEach((g) => {
          favorites.forEach((f) => {
            if (g.gameId === f.gameId) {
              gameMap.set(g.gameId, g.stages);
            }
          });
        });
        res.render('favorite', {
          user: req.user,
          games: games,
          gameMap: gameMap,
          favoriteMap: favoriteMap
        });
      });
    });
  } else {
    const err = new Error('指定されたゲームがない、または、権限がありません');
    err.status = 404;
    next(err);
  }
});
*/


module.exports = router;