'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');

const User = require('../models/user');
const Game = require('../models/game');
const Stage = require('../models/stage');
const Favorite = require('../models/favorite');
const Comment = require('../models/comment');
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
    Like.findAll({
      where: {
        gameId: gameId,
        likeState: 1
      }
    }).then((likes) => {
      const cnt = likes.length;
      res.json({ status: 'OK', like: like, likeCount: cnt });
    });
    /*
    res.json({ status: 'OK', like: like });
    Like.findAll({
      attributes: [[sequelize.fn('COUNT', sequelize.col('userId')), 'cnt']],
      where: {
        gameId: gameId,
        like: 1
      }
    }).then((likes) => {
      res.json({
        status: 'OK',
        like: like,
        likeCount: likes.cnt
      });
    });
    */

  });
});

module.exports = router;