'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const User = require('../models/user');
const Game = require('../models/game');
const Stage = require('../models/stage');
const Favorite = require('../models/favorite');

router.get('/:userId', authenticationEnsurer, (req, res, next) => {
  if (req.user) {
    Game.findAll({
      include: [{
        model: Stage,
        attributes: ['stageTitle', 'stageContent']
      }],
      where: {
        createdBy: req.user.id
      },
      order: '"updatedAt" DESC'
    }).then((games) => {
      const gameMap = new Map();
      games.forEach((g) => {
        gameMap.set(g.gameId, g.stages);
      });
      res.render('user', {
        user: req.user,
        games: games,
        gameMap: gameMap
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


/*
router.get('/:userId/gemes', authenticationEnsurer, (req, res, next) => {
  if (req.user) {
    Game.findAll({
      include: [{
        model: User,
        attributes: ['userId', 'username', 'nickname']
      }],
      where: {
        createdBy: req.user.id
      },
      order: '"updatedAt" DESC'
    }).then((games) => {
      Stage.findAll({
        where: {
          userId: req.user.id
        },
        order: '"stageId" DESC'
      }).then((stages) => {
        const gameMap = new Map();
        games.forEach((g) => {
          const stageArray = new Array();
          stages.forEach((s) => {
            if (g.gameId === s.gameId) {
              stageArray.push([s.stageTitle, s.stageContent]);
            }
          });
          gameMap.set(g.gameId, stageArray);
          console.log(gameMap);
        });
        res.render('user', {
          user: req.user,
          games: games,
          gameMap: gameMap
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