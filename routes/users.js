'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const User = require('../models/user');
const Game = require('../models/game');
const Stage = require('../models/stage');
const Favorite = require('../models/favorite');

router.get('/:userId', (req, res, next) => {
  if (req.user) {
    Game.findAll({
      include: [{
        model: Stage,
        attributes: ['stageTitle', 'stageContent']
      },{
        model: Favorite,
        attributes: ['gameId', 'favorite', 'favorite']
      }],
      where: { createdBy: req.user.id },
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
    const err = new Error('指定されたゲームがない、または、権限がありません');
    err.status = 404;
    next(err);
  }
});

router.post('/:userId/games/:gemeId', authenticationEnsurer, (req, res, next) => {
  const gameId = req.params.gemeId;
  const userId = req.params.userId;
  let favorite = req.body.favorite;
  favorite = favorite ? parseInt(favorite) : 0;

  Favorite.upsert({
    gameId: gameId,
    userId: userId,
    favorite: favorite
  }).then(() => {
    res.json({ status: 'OK', favorite: favorite });
    console.log(favorite);
  });
});

module.exports = router;