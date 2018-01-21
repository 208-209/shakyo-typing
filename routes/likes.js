'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const Like = require('../models/like');

router.post('/:userId/games/:gemeId/like', authenticationEnsurer, (req, res, next) => {
  const gameId = req.params.gemeId;
  const userId = req.params.userId;
  let like = req.body.like;
  like = like ? parseInt(like) : 0;

  Like.upsert({
    gameId: gameId,
    userId: userId,
    likeState: like
  }).then(() => {
    return Like.findAll({
      where: {
        gameId: gameId,
        likeState: 1
      }
    });
  }).then((likes) => {
    const likeCount = likes.length;
    res.json({ status: 'OK', like: like, likeCount: likeCount });
  });
});

module.exports = router;