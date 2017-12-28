'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('node-uuid');
const User = require('../models/user');
const Game = require('../models/game');
const Stage = require('../models/stage');

router.post('/:gameId/comments', authenticationEnsurer, (req, res, next) => {
  const comment = req.body.comment;
  console.log('投稿されました: ' + comment);

});

module.exports = router;