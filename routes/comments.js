'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const User = require('../models/user');
const Comment = require('../models/comment');

router.post('/:gameId/comments', authenticationEnsurer, (req, res, next) => {
  const gameId = req.params.gameId;
  Comment.create({
    comment: req.body.comment,
    trackingCookie: '0123',
    gameId: gameId,
    postedBy: req.user.id
  }).then(() => {
    res.redirect('/games/' + gameId);
  });
});

module.exports = router;