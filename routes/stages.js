'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const User = require('../models/user');
const Game = require('../models/game');
const Stage = require('../models/stage');

router.post('/:gameId/stages', authenticationEnsurer, (req, res, next) => {
    Game.findOne({
      where: {
        gameId: req.params.gameId
      }
    }).then((game) => {
      Stage.create({
        stageTitle: req.body.stageTitle,
        stageContent: req.body.stageContent,
        gameId: game.gameId,
        createdBy: req.user.id
      }).then(() => {
        res.redirect('/games/' + game.gameId + '/edit');
      });
    });

});

module.exports = router;