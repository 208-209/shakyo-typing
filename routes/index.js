'use strict';
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Game = require('../models/game');
const Stage = require('../models/stage');

router.get('/', (req, res, next) => {
  if (req.user) {
    Game.findAll({
      include: [{
        model: User,
        attributes: ['userId', 'username']
      }],
      where: {
        createdBy: req.user.id
      },
      order: '"updatedAt" DESC'
    }).then((myGames) => {
      Stage.findAll({
        include: [{
          model: Game,
          attributes: ['gameId', 'gameName']
        }],
        where: {
          createdBy: req.user.id
        },
        order: '"stageId" DESC'
      }).then((myStages) => {
        const gameMap = new Map();
        myGames.forEach((g) => {
          const stageArray = new Array();
          myStages.forEach((s) => {
            if (g.gameId === s.gameId) {
              stageArray.push([s.stageTitle, s.stageContent]);
            }
          });
          console.log(stageArray);
          gameMap.set(g.gameId, stageArray)
          console.log(gameMap);
        });
        res.render('index', {
          user: req.user,
          myGames:myGames,
          myStages: myStages,
          gameMap:gameMap
        });
      });
    });
  } else {
    res.render('index', { user: req.user });
  }
});

module.exports = router;