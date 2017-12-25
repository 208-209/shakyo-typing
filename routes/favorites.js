'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const User = require('../models/user');
const Game = require('../models/game');
const Stage = require('../models/stage');
const Favorite = require('../models/favorite');

router.get('/:userId/favorites', authenticationEnsurer, (req, res, next) => {
  if (req.user) {
    Favorite.findAll({
      include: [{
        model: Game,
        attributes: ['gameName', 'tags', 'privacy', 'createdBy']
      }],
      where: {
        userId: req.user.id,
        favorite: 1
      },
      order: '"updatedAt" DESC'
    }).then((favoriteGames) => {
      const favoriteMap = new Map();
      favoriteGames.forEach((f) => {
        favoriteMap.set(f.gameId, f.favorite);
      });
      Stage.findAll().then((stages) => {
        const gameMap = new Map();
        favoriteGames.forEach((f) => {
          const stageArray = new Array();
          stages.forEach((s) => {
            if (f.gameId === s.gameId) {
              stageArray.push({stageTitle:s.stageTitle, stageContent:s.stageContent});
            }
          });
          gameMap.set(g.gameId, stageArray);
          console.log(gameMap);
        });
        res.render('favorite', {
          user: req.user,
          favoriteGames: favoriteGames,
          gameMap: gameMap,
          favoriteMap:favoriteMap
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