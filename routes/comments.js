'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const Comment = require('../models/comment');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// コメントの投稿・削除
router.post('/:gameId/comments', authenticationEnsurer, csrfProtection, (req, res, next) => {
  const gameId = req.params.gameId;
  if (parseInt(req.query.delete) === 1) {
    Comment.findById(req.body.commentId).then((comment) => {
      // 投稿者 または 管理人
      if (req.user.id === comment.postedBy || req.user.id === '30428943') {
        comment.destroy();
        console.info(
          `【コメントの削除】user: ${req.user.username}, ${req.user.provider}, ${req.user.id} ` +
          `remoteAddress: ${req.connection.remoteAddress}, ` +
          `userAgent: ${req.headers['user-agent']} `
        );
        res.redirect('/games/' + gameId);
      } else {
        const err = new Error('削除する権限がありません');
        err.status = 404;
        next(err);
      }
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