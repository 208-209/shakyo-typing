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
        attributes: ['userId', 'favorite']
      }],
      where: {
        privacy: 'public'
      },
      order: '"updatedAt" DESC'
    }).then((games) => {
      const gameMap = new Map();
      const favoriteMap = new Map();
      games.forEach((g) => {
        gameMap.set(g.gameId, g.stages);
        const favorite = g.favorite.favorite || 0;
        favoriteMap.set(g.gameId, favorite);
      });
      console.log(games.favorite);
      res.render('index', {
        user: req.user,
        games: games,
        gameMap: gameMap,
        favoriteMap:favoriteMap
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

/*
router.get('/', (req, res, next) => {
  if (req.user) {
    Game.findAll({
      include: [{
        model: Stage,
        attributes: ['stageTitle', 'stageContent']
      }],
      where: { privacy: 'public' },
      order: '"updatedAt" DESC'
    }).then((games) => {
      const gameMap = new Map();
      games.forEach((g) => {
        gameMap.set(g.gameId, g.stages);
      });
      Game.findAll({
        include: [{
          model: Favorite,
          attributes: ['userId', 'favorite']
        }],
        where: { createdBy: req.user.id }
      }).then((favoriteGames) => {
        const favoriteMap = new Map();
        favoriteGames.forEach((f) => {
          const favorite = f.favorite ? f.favorite : 0;
          favoriteMap.set(f.gameId, favorite);
        });
        console.log(favoriteGames);
        console.log(favoriteGames.favorite);
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
*/
/*
router.get('/', (req, res, next) => {
  Game.findAll({
    include: [{
      model: User,
      attributes: ['userId', 'username', 'nickname']
    }],
    where: {
      privacy: 'public'
    },
    order: '"updatedAt" DESC'
  }).then((games) => {
    Stage.findAll({
    }).then((stages) => {
      const gameMap = new Map();
      games.forEach((g) => {
        const stageArray = new Array();
        stages.forEach((s) => {
          if (g.gameId === s.gameId) {
            stageArray.push([s.stageTitle, s.stageContent]);
          }
        });
        gameMap.set(g.gameId, stageArray)
        console.log(gameMap);
      });
      res.render('index', {
        user: req.user,
        games: games,
        gameMap: gameMap
      });
    });
  });
});
*/
module.exports = router;