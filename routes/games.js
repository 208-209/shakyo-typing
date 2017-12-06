'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('node-uuid');
const User = require('../models/user');
const Game = require('../models/game');
const Stage = require('../models/stage');
const Comment = require('../models/comment');

router.get('/new', authenticationEnsurer, (req, res, next) => {
  res.render('new', { user: req.user });
});

router.post('/', authenticationEnsurer, (req, res, next) => {
  const gameId = uuid.v4();
  const tagArray = req.body.tab.trim().split('\n').map((t) => t.trim());
  Game.create({
    gameId: gameId,
    gameName: req.body.gameName.slice(0, 255),
    tag: tagArray,
    privacy: req.body.privacy,
    createdBy: req.user.id
  }).then((game) => {
    res.redirect('/games/' + game.gameId + '/edit');
  });
});

router.get('/:gameId', authenticationEnsurer, (req, res, next) => {
  Game.findOne({
    include: [{
      model: User,
      attributes: ['userId', 'username']
    }],
    where: {
      gameId: req.params.gameId
    }
  }).then((game) => {

    if (game) {
      Stage.findAll({
        where: {
          gameId: game.gameId
        },
        order: '"stageId" ASC'
      }).then((stages) => {
        res.render('game', {
          user: req.user,
          game: game,
          stages: stages
        });
      });

      
    } else {
      const err = new Error('指定されたゲームは見つかりません');
      err.status = 404;
      next(err);
    }
  });
});

router.get('/:gameId/edit', authenticationEnsurer, (req, res, next) => {
  Game.findOne({
    where: {
      gameId: req.params.gameId
    }
  }).then((game) => {
    Stage.findAll({
      where: {
        gameId: game.gameId
      },
      order: '"stageId" ASC'
    }).then((stages) => {
      const tags = game.tag.join('\n');
      res.render('edit', {
        user: req.user,
        game: game,
        tags: tags,
        stages: stages
      });
    });
  });
});



module.exports = router;