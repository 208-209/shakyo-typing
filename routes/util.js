'use strict';

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

function isMine(req, game) {
  return game && req.user.id === game.createdBy;
}

function parseTags(req) {
    return req.body.tags.trim().split('\n').map((t) => t.trim()).join('\n').slice(0, 255);
  }


module.exports = {
  createGameMap: createGameMap,
  createFavoriteMap: createFavoriteMap,
  createLikeMap: createLikeMap,
  createLikeCountMap: createLikeCountMap,
  isMine: isMine,
  parseTags: parseTags
};