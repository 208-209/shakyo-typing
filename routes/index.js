'use strict';
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Game = require('../models/game');
const Stage = require('../models/stage');

let myGames;
let myGameMap = new Map();
let publicGames;
let publicGameMap = new Map();

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
    }).then((games) => {
      myGames = games;
      Stage.findAll({
        where: {
          createdBy: req.user.id
        },
        order: '"stageId" DESC'
      }).then((myStages) => {
        myGames.forEach((g) => {
          const stageArray = new Array();
          myStages.forEach((s) => {
            if (g.gameId === s.gameId) {
              stageArray.push([s.stageTitle, s.stageContent]);
            }
          });
          console.log(stageArray);
          myGameMap.set(g.gameId, stageArray)
          console.log(myGameMap);
        });
        res.render('index', {
          user: req.user,
          myGames:myGames,
          myGameMap: myGameMap,
          publicGames: publicGames,
          publicGameMap: publicGameMap
        });
      });
    });
  } else {
    Game.findAll({
      include: [{
        model: User,
        attributes: ['userId', 'username']
      }],
      where: {
        privacy: 1
      },
      order: '"updatedAt" DESC'
    }).then((games) => {
      publicGames = games;
      Stage.findAll({
      }).then((publicStages) => {
        publicGames.forEach((g) => {
          const stageArray = new Array();
          publicStages.forEach((s) => {
            if (g.gameId === s.gameId) {
              stageArray.push([s.stageTitle, s.stageContent]);
            }
          });
          console.log(stageArray);
          publicGameMap.set(g.gameId, stageArray)
          console.log(publicGameMap);
        });
        res.render('index', {
          user: req.user,
          publicGames: publicGames,
          publicGameMap: publicGameMap
        });
      });
    });
  }
});
/*
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
          myGames: myGames,
          myStages: myStages,
          gameMap: gameMap
        });
      });
    });
  } else {
    Game.findAll({
      include: [{
        model: User,
        attributes: ['userId', 'username']
      }],
      where: {
        privacy: 1
      },
      order: '"updatedAt" DESC'
    }).then((publicGames) => {
      Stage.findAll({
        include: [{
          model: Game,
          attributes: ['gameId', 'gameName']
        }],
        order: '"stageId" DESC'
      }).then((publicStages) => {
        const gameMap = new Map();
        publicGames.forEach((g) => {
          const stageArray = new Array();
          publicStages.forEach((s) => {
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
          publicGames: publicGames,
          publicStages: publicStages,
          gameMap: gameMap
        });
      });
    });
  }
});
*/

module.exports = router;