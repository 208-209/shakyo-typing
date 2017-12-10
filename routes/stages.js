'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const User = require('../models/user');
const Game = require('../models/game');
const Stage = require('../models/stage');

router.post('/:gameId/stages', authenticationEnsurer, (req, res, next) => {
  if (parseInt(req.query.edit) === 1) {
    Game.findOne({
      where: {
        gameId: req.params.gameId
      }
    }).then((game) => {
      if (isMineGame(req, game)) {
        Stage.create({
          stageTitle: req.body.stageTitle,
          stageContent: req.body.stageContent,
          gameId: game.gameId,
          createdBy: req.user.id
        }).then(() => {
          res.redirect('/games/' + game.gameId + '/edit');
        });
      } else {
        const err = new Error('指定されたゲームがない、または、追加する権限がありません');
        err.status = 404;
        next(err);
      }
    });
  
  } else if (parseInt(req.query.delete) === 1) {
    Game.findOne({
      where: {
        gameId: req.params.gameId,
      }
    }).then((game) => {
      if (isMineGame(req, game)) {
        Stage.findOne({
          where: {
            stageId: req.body.stageId
          }
        }).then((stage) => {
          stage.destroy();
        }).then(() => {
          res.redirect('/games/' + game.gameId + '/edit');
        });
      } else {
        const err = new Error('指定されたゲームがない、または、追加する権限がありません');
        err.status = 404;
        next(err);
      }
    });
  }
});

function isMineGame(req, game) {
  return game && parseInt(game.createdBy) === parseInt(req.user.id);
}

module.exports = router;