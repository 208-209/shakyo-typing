'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const User = require('../models/user');
const Game = require('../models/game');
const Comment = require('../models/comment');

router.post('/:gameId/comments', authenticationEnsurer, (req, res, next) => {
    Game.findOne({
      where: {
        gameId: req.params.gameId
      }
    }).then((game) => {

    });
});

module.exports = router;