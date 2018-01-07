'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('node-uuid');
const moment = require('moment-timezone');
const User = require('../models/user');
const Game = require('../models/game');
const Stage = require('../models/stage');
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
  const tagArray = req.body.tags.trim().split('\n').map((t) => t.trim());
  Game.create({
    gameId: gameId,
    gameName: req.body.gameName.slice(0, 255),
    tags: tagArray,
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
  Game.findOne({
    include: [{
      model: User,
      attributes: ['userId', 'username']
    }],
    where: { gameId: req.params.gameId }
  }).then((game) => {
    game.formattedCreatedAt = moment(game.updatedAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
    // プライバシーが公開 || プライバシーが非公開 && 作成者と閲覧者が同一
    if (game && (game.privacy === 'public' || game.privacy === 'secret' && req.user.id === game.createdBy)) {
      Stage.findAll({
        where: { gameId: game.gameId },
        order: '"stageId" DESC'
      }).then((stages) => {
        Comment.findAll({
          include: [{
            model: User,
            attributes: ['userId', 'username']
          }],
          where: {
            gameId: req.params.gameId
          },
          order: '"commentId" ASC'
        }).then((comments) => {
          res.render('game', {
            user: req.user,
            game: game,
            stages: stages,
            comments: comments,
            csrfToken: req.csrfToken()
          });
        });
      });
    } else {
      const err = new Error('指定されたゲームは見つかりません');
      err.status = 404;
      next(err);
    }
  });
});

// ゲームの編集ページの表示
router.get('/:gameId/edit', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Game.findOne({
    where: { gameId: req.params.gameId }
  }).then((game) => {
    if (game && req.user.id === game.createdBy) { // 作成者のみが編集フォームを開ける
      Stage.findAll({
        where: { gameId: game.gameId },
        order: '"stageId" DESC'
      }).then((stages) => {
        const tags = game.tags.join('\n');
        res.render('edit', {
          user: req.user,
          game: game,
          tags: tags,
          stages: stages,
          csrfToken: req.csrfToken()
        });
        console.log(game.privacy);
      });
    } else {
      const err = new Error('指定されたゲームがない、または、編集する権限がありません');
      err.status = 404;
      next(err);
    }
  });
});

// ゲームの編集・削除
router.post('/:gameId', authenticationEnsurer, csrfProtection, (req, res, next) => {
  if (parseInt(req.query.edit) === 1) { // 編集
    Game.findOne({
      where: { gameId: req.params.gameId }
    }).then((game) => {
      if (game && req.user.id === game.createdBy) { // 作成者のみ
        const tagArray = req.body.tags.trim().split('\n').map((t) => t.trim());
        game.update({
          gameId: game.gameId,
          gameName: req.body.gameName,
          tags: tagArray,
          privacy: req.body.privacy,
          createdBy: req.user.id
        }).then(() => {
          res.redirect('/');
          console.info(
            `【ゲームの編集】user: ${req.user.username}, ${req.user.provider}, ${req.user.id} ` +
            `remoteAddress: ${req.connection.remoteAddress}, ` +
            `userAgent: ${req.headers['user-agent']} `
          );
        });
      } else {
        const err = new Error('指定されたゲームがない、または、編集する権限がありません');
        err.status = 404;
        next(err);
      }
    });
  } else if (parseInt(req.query.delete) === 1) { // 削除
    Game.findOne({
      where: {
        gameId: req.params.gameId
      }
    }).then((game) => {
      if (game && (req.user.id === game.createdBy || req.user.id === '30428943')) { // 作成者 と 管理人が削除
        deleteGame(game.gameId, () => {
          res.redirect('/');
          console.info(
            `【ゲームの削除】user: ${req.user.username}, ${req.user.provider}, ${req.user.id} ` +
            `remoteAddress: ${req.connection.remoteAddress}, ` +
            `userAgent: ${req.headers['user-agent']} `
          );
        });
      }
    });
  } else {
    const err = new Error('不正なリクエストです');
    err.status = 400;
    next(err);
  }
});

function deleteGame(gameId, done, err) {
  Stage.findAll({
    where: { gameId: gameId }
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