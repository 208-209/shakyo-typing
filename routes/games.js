'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('node-uuid');
const User = require('../models/user');
const Game = require('../models/game');
const Stage = require('../models/stage');
const Comment = require('../models/comment');

router.get('/new', authenticationEnsurer, (req, res, next) => {
  res.render('new', { user: req.user });
});

router.post('/', authenticationEnsurer, (req, res, next) => {
  const gameId = uuid.v4();
  const tagArray = req.body.tag.trim().split('\n').map((t) => t.trim());
  Game.create({
    gameId: gameId,
    gameName: req.body.gameName.slice(0, 255),
    tag: tagArray,
    privacy: req.body.privacy,
    createdBy: req.user.id
  }).then((game) => {
    res.redirect('/games/' + game.gameId + '/edit');
  });
});

router.get('/:gameId', authenticationEnsurer, (req, res, next) => {
  Game.findOne({
    include: [{
      model: User,
      attributes: ['userId', 'username']
    }],
    where: {
      gameId: req.params.gameId
    }
  }).then((game) => {
    // (プライバシーが公開 && ゲームがある) || (プライバシーが非公開 && 作成者と閲覧者が同一 && ゲームがある)
    if (game) {
      Stage.findAll({
        where: {
          gameId: game.gameId
        },
        order: '"stageId" ASC'
      }).then((stages) => {
        res.render('game', {
          user: req.user,
          game: game,
          stages: stages
        });
      });


    } else {
      const err = new Error('指定されたゲームは見つかりません');
      err.status = 404;
      next(err);
    }
  });
});

router.get('/:gameId/edit', authenticationEnsurer, (req, res, next) => {
  Game.findOne({
    where: {
      gameId: req.params.gameId
    }
  }).then((game) => {
    if (isMineGame(req, game)) { // 作成者のみが編集フォームを開ける
      Stage.findAll({
        where: {
          gameId: game.gameId
        },
        order: '"stageId" ASC'
      }).then((stages) => {
        const tags = game.tag.join('\n');
        res.render('edit', {
          user: req.user,
          game: game,
          tags: tags,
          stages: stages
        });
      });
    } else {
      const err = new Error('指定されたゲームがない、または、編集する権限がありません');
      err.status = 404;
      next(err);
    }
  });
});

router.post('/:gameId', authenticationEnsurer, (req, res, next) => {
  if (parseInt(req.query.edit) === 1) {
    Game.findOne({
      where: {
        gameId: req.params.gameId
      }
    }).then((game) => {
      if (isMineGame(req, game)) { // 作成者のみ
        const tagArray = req.body.tag.trim().split('\n').map((t) => t.trim());
        game.update({
          gameId: game.gameId,
          gameName: req.body.gameName,
          tag: tagArray,
          privacy: req.body.privacy,
          createdBy: req.user.id
        }).then(() => {
          res.redirect('/');
        });
      } else {
        const err = new Error('指定されたゲームがない、または、編集する権限がありません');
        err.status = 404;
        next(err);
      }
    });
  } else if (parseInt(req.query.delete) === 1) {

  } else {
    const err = new Error('不正なリクエストです');
    err.status = 400;
    next(err);
  }
});

function isMineGame(req, game) {
  return game && parseInt(game.createdBy) === parseInt(req.user.id);
}

module.exports = router;