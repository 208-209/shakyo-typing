'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const util = require('./util.js');
const Comment = require('../models/comment');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// コメントの投稿
router.post('/:gameId/comments', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Comment.create({
    comment: req.body.comment,
    gameId: req.params.gameId,
    createdBy: req.user.id
  }).then(() => {
    res.redirect('/games/' + req.params.gameId);
    console.info(
      `【コメントの投稿】user: ${req.user.username}, ${req.user.provider}, ${req.user.id} ` +
      `remoteAddress: ${req.connection.remoteAddress}, ` +
      `userAgent: ${req.headers['user-agent']} `
    );
  });
});

// コメントの削除
router.post('/:gameId/comments/delete', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Comment.findById(req.body.commentId).then((comment) => {
    // 投稿者 または 管理人
    if (util.isMine(req, comment) || util.isAdmin(req)) {
      comment.destroy();
      console.info(
        `【コメントの削除】user: ${req.user.username}, ${req.user.provider}, ${req.user.id} ` +
        `remoteAddress: ${req.connection.remoteAddress}, ` +
        `userAgent: ${req.headers['user-agent']} `
      );
      res.redirect('/games/' + req.params.gameId);
    } else {
      const err = new Error('削除する権限がありません');
      err.status = 404;
      next(err);
    }
  });
});

module.exports = router;