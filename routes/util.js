'use strict';
const moment = require('moment-timezone');

function createGameMap(games, gameMap) {
  games.forEach((g) => {
    gameMap.set(g.gameId, g.stages);
  });
}

function createFavoriteMap(favorites, favoriteMap) {
  favorites.forEach((f) => {
    favoriteMap.set(f.gameId, f.favorite);
  });
}

function createLikeMap(likes, likeMap) {
  likes.forEach((l) => {
    likeMap.set(l.gameId, l.likeState);
  });
}

function createLikeCountMap(likeCount, likeCountMap) {
  likeCount.forEach((l) => {
    likeCountMap.set(l.gameId, l.dataValues['count']); // l.countではundefined
  });
}

function isMine(req, data) {
  return req.user.id === data.createdBy;
}

function isAdmin(req) {
  return req.user.id === process.env.ADMIN_ID;
}

function parseTags(req) {
  return req.body.tags.trim().split('\n').map((t) => t.trim()).join('\n').slice(0, 255);
}

function momentTimezone(data) {
  data.forEach((d) => {
    d.formattedUpdatedAt = moment(d.updatedAt).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm');
  });
}

module.exports = {
  createGameMap: createGameMap,
  createFavoriteMap: createFavoriteMap,
  createLikeMap: createLikeMap,
  createLikeCountMap: createLikeCountMap,
  isMine: isMine,
  isAdmin: isAdmin,
  parseTags: parseTags,
  momentTimezone: momentTimezone
};