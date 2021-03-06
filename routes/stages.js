'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const util = require('./util.js');
const Game = require('../models/game');
const Stage = require('../models/stage');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// ステージの作成
router.post('/:gameId/stages', authenticationEnsurer, csrfProtection, (req, res, next) => {
  let storedGame = null;
  Game.findOne({
    where: { gameId: req.params.gameId }
  }).then((game) => {
    storedGame = game
    // ゲームの作成者のみ
    if (game && util.isMine(req, game)) {
      return Stage.create({
        stageTitle: req.body.stageTitle.slice(0, 255),
        stageContent: req.body.stageContent,
        gameId: game.gameId,
        createdBy: req.user.id
      });
    } else {
      const err = new Error('作成する権限がありません');
      err.status = 404;
      next(err);
    }
  }).then(() => {
    res.redirect('/games/' + storedGame.gameId + '/edit');
    console.info(
      `【ステージの作成】user: ${req.user.username}, ${req.user.provider}, ${req.user.id} ` +
      `remoteAddress: ${req.connection.remoteAddress}, ` +
      `userAgent: ${req.headers['user-agent']} `
    );
  });
});

// ステージの編集・削除
router.post('/:gameId/stages/:stageId', authenticationEnsurer, csrfProtection, (req, res, next) => {
  let storedGame = null;
  if (parseInt(req.query.edit) === 1) {
    Game.findOne({
      where: { gameId: req.params.gameId }
    }).then((game) => {
      storedGame = game
      // ゲームの作成者のみ
      if (game && util.isMine(req, game)) {
        return Stage.findOne({
          where: { stageId: req.params.stageId }
        });
      } else {
        const err = new Error('編集する権限がありません');
        err.status = 404;
        next(err);
      }
    }).then((stage) => {
      return stage.update({
        stageId: req.params.stageId,
        stageTitle: req.body.stageTitle.slice(0, 255),
        stageContent: req.body.stageContent,
        createdBy: req.user.id,
        gameId: req.params.gameId
      });
    }).then(() => {
      res.redirect('/games/' + storedGame.gameId + '/edit');
      console.info(
        `【ステージの編集】user: ${req.user.username}, ${req.user.provider}, ${req.user.id} ` +
        `remoteAddress: ${req.connection.remoteAddress}, ` +
        `userAgent: ${req.headers['user-agent']} `
      );
    });
  } else if (parseInt(req.query.delete) === 1) {
    Game.findOne({
      where: { gameId: req.params.gameId }
    }).then((game) => {
      storedGame = game
      // ゲームの作成者のみ
      if (game && util.isMine(req, game)) {
        return Stage.findOne({
          where: { stageId: req.params.stageId }
        });
      } else {
        const err = new Error('削除する権限がありません');
        err.status = 404;
        next(err);
      }
    }).then((stage) => {
      return stage.destroy();
    }).then(() => {
      res.redirect('/games/' + storedGame.gameId + '/edit');
      console.info(
        `【ステージの削除】user: ${req.user.username}, ${req.user.provider}, ${req.user.id} ` +
        `remoteAddress: ${req.connection.remoteAddress}, ` +
        `userAgent: ${req.headers['user-agent']} `
      );
    });
  }
});

module.exports = router;