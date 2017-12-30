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
  const tagArray = req.body.tags.trim().split('\n').map((t) => t.trim());
  Game.create({
    gameId: gameId,
    gameName: req.body.gameName.slice(0, 255),
    tags: tagArray,
    privacy: req.body.privacy,
    createdBy: req.user.id
  }).then((game) => {
    res.redirect('/games/' + game.gameId + '/edit');
  });
});

router.get('/:gameId', (req, res, next) => {
  Game.findOne({
    include: [{
      model: User,
      attributes: ['userId', 'username', 'nickname']
    }],
    where: {
      gameId: req.params.gameId
    }
  }).then((game) => {
    // プライバシーが公開 || プライバシーが非公開 && 作成者と閲覧者が同一
    if (game && (game.privacy === 'public' || game.privacy === 'secret' && req.user.id === game.createdBy)) {
      Stage.findAll({
        where: {
          gameId: game.gameId
        },
        order: '"stageId" DESC'
      }).then((stages) => {
        Comment.findAll({
          include: [{
            model: User,
            attributes: ['userId', 'username', 'nickname']
          }],
          where: {
            gameId: req.params.gameId
          },
          order: '"commentId" ASC'
        }).then((comments) => {
          res.render('game', {
            game: game,
            stages: stages,
            comments: comments,
            user: req.user
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

router.get('/:gameId/edit', authenticationEnsurer, (req, res, next) => {
  Game.findOne({
    where: {
      gameId: req.params.gameId
    }
  }).then((game) => {
    if (game && req.user.id === game.createdBy) { // 作成者のみが編集フォームを開ける
      Stage.findAll({
        where: {
          gameId: game.gameId
        },
        order: '"stageId" DESC'
      }).then((stages) => {
        const tags = game.tags.join('\n');
        res.render('edit', {
          user: req.user,
          game: game,
          tags: tags,
          stages: stages
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

router.post('/:gameId', authenticationEnsurer, (req, res, next) => {
  if (parseInt(req.query.edit) === 1) { // 編集
    Game.findOne({
      where: {
        gameId: req.params.gameId
      }
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
      if (game && (req.user.id === game.createdBy || req.user.id === '30428943' )) { // 作成者 と 管理人が削除
        deleteGame(game.gameId, () => {
          res.redirect('/');
        });
      }
    });
  } else {
    const err = new Error('不正なリクエストです');
    err.status = 400;
    next(err);
  }
});

function deleteGame (gameId, done, err) {
  Stage.findAll({
    where: {
      gameId: gameId
    }
  }).then((stages) => {
    const promises = stages.map((s) => { return s.destroy();});
    return Promise.all(promises);
  }).then(() => {
    return Game.findById(gameId).then((g) => { return g.destroy();});
  }).then(() => {
    if (err) return done(err);
    done();
  });
}

module.exports = router;