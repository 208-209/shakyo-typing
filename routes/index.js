'use strict';
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Game = require('../models/game');
const Stage = require('../models/stage');
const Post = require('../models/post');

router.get('/', (req, res, next) => {
  if (req.user) {
    Game.findAll({
      where: {
        createdBy: req.user.id
      },
      order: '"updatedAt" DESC'
    }).then((myGames) => {
      res.render('index', {
        user: req.user,
        myGames:myGames
      });
    });
  } else {
    res.render('index', { user: req.user });
  }
});

module.exports = router;