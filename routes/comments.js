'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const User = require('../models/user');
const Comment = require('../models/comment');

router.post('/:gameId/comments', authenticationEnsurer, (req, res, next) => {
  const gameId = req.params.gameId;
  if (parseInt(req.query.delete) === 1) {
    Comment.findById(req.body.id).then((comment) => {
      if (req.user.id === comment.postedBy || req.user.id === '30428943') { // 投稿者 または 管理人が削除
        comment.destroy();
        console.info(
          `【コメントの削除】user: ${req.user.username}, ${req.user.provider}, ${req.user.id} ` +
          `remoteAddress: ${req.connection.remoteAddress}, ` +
          `userAgent: ${req.headers['user-agent']} `
        );
      }
      res.redirect('/games/' + gameId);
    });
  } else {
    Comment.create({
      comment: req.body.comment,
      gameId: gameId,
      postedBy: req.user.id
    }).then(() => {
      res.redirect('/games/' + gameId);
      console.info(
        `【コメントの投稿】user: ${req.user.username}, ${req.user.provider}, ${req.user.id} ` +
        `remoteAddress: ${req.connection.remoteAddress}, ` +
        `userAgent: ${req.headers['user-agent']} `
      );
    });
  }
});

module.exports = router;