'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const util = require('./util.js');
const uuid = require('node-uuid');
const moment = require('moment-timezone');
const User = require('../models/user');
const Game = require('../models/game');
const Stage = require('../models/stage');
const Favorite = require('../models/favorite');
const Like = require('../models/like');
const Comment = require('../models/comment');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// ゲームの新規作成ページ
router.get('/new', authenticationEnsurer, csrfProtection, (req, res, next) => {
  res.render('new', {
    user: req.user,
    csrfToken: req.csrfToken()
  });
});

// ゲームの新規作成
router.post('/', authenticationEnsurer, csrfProtection, (req, res, next) => {
  const gameId = uuid.v4();
  const tags = util.parseTags(req);
  Game.create({
    gameId: gameId,
    gameName: req.body.gameName.slice(0, 255),
    tags: tags,
    privacy: req.body.privacy,
    createdBy: req.user.id
  }).then((game) => {
    res.redirect('/games/' + game.gameId + '/edit');
    console.info(
      `【ゲームの新規作成】user: ${req.user.username}, ${req.user.provider}, ${req.user.id} ` +
      `remoteAddress: ${req.connection.remoteAddress}, ` +
      `userAgent: ${req.headers['user-agent']} `
    );
  });
});

// ゲームの詳細
router.get('/:gameId', csrfProtection, (req, res, next) => {
  let storedGame = null;
  let storedStages = null;
  Game.findOne({
    include: [{
      model: User,
      attributes: ['userId', 'username', 'image']
    }],
    where: { gameId: req.params.gameId }
  }).then((game) => {
    game.formattedCreatedAt = moment(game.updatedAt).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm');
    storedGame = game;
    // プライバシー設定が公開なら誰でも または プライバシー設定が非公開なら作成者のみ
    if (game && game.privacy === 'public' || game && game.privacy === 'secret' && util.isMine(req, game)) {
      return Stage.findAll({
        where: { gameId: game.gameId },
        order: '"stageId" DESC'
      });
    } else {
      const err = new Error('指定されたゲームは見つかりません');
      err.status = 404;
      next(err);
    }
  }).then((stages) => {
    util.momentTimezone(stages);
    storedStages = stages;
    return Comment.findAll({
      include: [{
        model: User,
        attributes: ['userId', 'username', 'image']
      }],
      where: { gameId: req.params.gameId },
      order: '"commentId" ASC'
    });
  }).then((comments) => {
    util.momentTimezone(comments);
    res.render('game', {
      user: req.user,
      game: storedGame,
      stages: storedStages,
      comments: comments,
      csrfToken: req.csrfToken()
    });
  });
});

// ゲームの編集ページの表示
router.get('/:gameId/edit', authenticationEnsurer, csrfProtection, (req, res, next) => {
  let storedGame = null;
  Game.findOne({
    where: { gameId: req.params.gameId }
  }).then((game) => {
    storedGame = game
    // 作成者のみ
    if (game && util.isMine(req, game)) {
      return Stage.findAll({
        where: { gameId: game.gameId },
        order: '"stageId" DESC'
      });
    } else {
      const err = new Error('指定されたゲームがない、または、編集する権限がありません');
      err.status = 404;
      next(err);
    }
  }).then((stages) => {
    util.momentTimezone(stages);
    res.render('edit', {
      user: req.user,
      game: storedGame,
      stages: stages,
      csrfToken: req.csrfToken()
    });
  });
});

// ゲームの編集・削除
router.post('/:gameId', authenticationEnsurer, csrfProtection, (req, res, next) => {
  if (parseInt(req.query.edit) === 1) {
    Game.findOne({
      where: { gameId: req.params.gameId }
    }).then((game) => {
      if (game && util.isMine(req, game)) { // 作成者のみ
        const tags = util.parseTags(req);
        return game.update({
          gameId: game.gameId,
          gameName: req.body.gameName.slice(0, 255),
          tags: tags,
          privacy: req.body.privacy,
          createdBy: req.user.id
        });
      } else {
        const err = new Error('指定されたゲームがない、または、編集する権限がありません');
        err.status = 404;
        next(err);
      }
    }).then(() => {
      res.redirect('/games/' + req.params.gameId + '/edit');
      console.info(
        `【ゲームの編集】user: ${req.user.username}, ${req.user.provider}, ${req.user.id} ` +
        `remoteAddress: ${req.connection.remoteAddress}, ` +
        `userAgent: ${req.headers['user-agent']} `
      );
    });
  } else if (parseInt(req.query.delete) === 1) {
    Game.findOne({
      where: { gameId: req.params.gameId }
    }).then((game) => {
      if (game && util.isMine(req, game) || game && util.isAdmin(req)) { // 作成者 または 管理人
        deleteGame(req.params.gameId, () => {
          res.redirect('/');
          console.info(
            `【ゲームの削除】user: ${req.user.username}, ${req.user.provider}, ${req.user.id} ` +
            `remoteAddress: ${req.connection.remoteAddress}, ` +
            `userAgent: ${req.headers['user-agent']} `
          );
        });
      } else {
        const err = new Error('指定されたゲームがない、または、削除する権限がありません');
        err.status = 404;
        next(err);
      }
    });
  } else {
    const err = new Error('不正なリクエストです');
    err.status = 400;
    next(err);
  }
});

function deleteGame(gameId, done, err) {
  Like.findAll({
    where: { gameId: gameId }
  }).then((likes) => {
    const promises = likes.map((l) => { return l.destroy(); });
    return Promise.all(promises);
  }).then(() => {
    return Favorite.findAll({
      where: { gameId: gameId }
    });
  }).then((favorites) => {
    const promises = favorites.map((f) => { return f.destroy(); });
    return Promise.all(promises);
  }).then(() => {
    return Comment.findAll({
      where: { gameId: gameId }
    });
  }).then((comments) => {
    const promises = comments.map((c) => { return c.destroy(); });
    return Promise.all(promises);
  }).then(() => {
    return Stage.findAll({
      where: { gameId: gameId }
    });
  }).then((stages) => {
    const promises = stages.map((s) => { return s.destroy(); });
    return Promise.all(promises);
  }).then(() => {
    return Game.findById(gameId).then((g) => { return g.destroy(); });
  }).then(() => {
    if (err) return done(err);
    done();
  });
}

module.exports = router;