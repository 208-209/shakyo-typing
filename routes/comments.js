'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');

const User = require('../models/user');
const Game = require('../models/game');
const Comment = require('../models/comment');

const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const trackingIdKey = 'tracking_id';

router.post('/:gameId/comments', authenticationEnsurer, (req, res, next) => {
  Game.findOne({
    where: {
      gameId: req.params.gameId
    }
  }).then((game) => {
    const createdAt = new Date();
    const trackingId = addTrackingCookie(req, res, next);
    Comment.create({
      comment: req.body.comment,
      createdAt: createdAt,
      trackingCookie: trackingId,
      gameId: game.gameId,
      createdBy: req.user.id
    }).then(() => {
      res.redirect('/games/' + game.gameId);
    });
  });
});

/**
 * Cookieに含まれているトラッキングIDに異常がなければその値を返し、
 * 存在しない場合や異常なものである場合には、再度作成しCookieに付与してその値を返す
 * @return {String} トラッキングID
 */
function addTrackingCookie(req, res, next) {
  const requestedTrackingId = req.cookies[trackingIdKey];
  const userName = req.user;
  if (isValidTrackingId(requestedTrackingId, userName)) {
    return requestedTrackingId;
  } else {
    const originalId = parseInt(crypto.randomBytes(8).toString('hex'), 16);
    const tomorrow = new Date(new Date().getTime() + (1000 * 60 * 60 * 24));
    const trackingId = originalId + '_' + createValidHash(originalId, userName);
    res.cookie(trackingIdKey, trackingId, { expires: tomorrow });
    return trackingId;
  }
}

function isValidTrackingId(trackingId, userName) {
  if (!trackingId) {
    return false;
  }
  const splitted = trackingId.split('_');
  const originalId = splitted[0];
  const requestedHash = splitted[1];
  return createValidHash(originalId, userName) === requestedHash;
}

const secretKey =
  '5a69bb55532235125986a0df24aca759f69bae045c7a66d6e2bc4652e3efb43da4' +
  'd1256ca5ac705b9cf0eb2c6abb4adb78cba82f20596985c5216647ec218e84905a' +
  '9f668a6d3090653b3be84d46a7a4578194764d8306541c0411cb23fbdbd611b5e0' +
  'cd8fca86980a91d68dc05a3ac5fb52f16b33a6f3260c5a5eb88ffaee07774fe2c0' +
  '825c42fbba7c909e937a9f947d90ded280bb18f5b43659d6fa0521dbc72ecc9b4b' +
  'a7d958360c810dbd94bbfcfd80d0966e90906df302a870cdbffe655145cc4155a2' +
  '0d0d019b67899a912e0892630c0386829aa2c1f1237bf4f63d73711117410c2fc5' +
  '0c1472e87ecd6844d0805cd97c0ea8bbfbda507293beebc5d9';

function createValidHash(originalId, userName) {
  const sha1sum = crypto.createHash('sha1');
  sha1sum.update(originalId + userName + secretKey);
  return sha1sum.digest('hex');
}

module.exports = router;