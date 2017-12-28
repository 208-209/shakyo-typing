'use strict';
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Game = require('../models/game');
const Stage = require('../models/stage');
const Favorite = require('../models/favorite');

router.get('/', (req, res, next) => {
  if (req.user) {
    Game.findAll({
      include: [{
        model: Stage,
        attributes: ['stageTitle', 'stageContent']
      },{
        model: Favorite,
        attributes: ['gameId', 'favorite', 'favorite']
      }],
      where: { privacy: 'public' },
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
        console.log(favoriteMap);
        res.render('index', {
          user: req.user,
          games: games,
          gameMap: gameMap,
          favoriteMap: favoriteMap
        });
      });
    });
  } else {
    Game.findAll({
      include: [{
        model: Stage,
        attributes: ['stageTitle', 'stageContent']
      }],
      where: {
        privacy: 'public'
      },
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