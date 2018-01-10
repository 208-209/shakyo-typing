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


module.exports = {
  createGameMap: createGameMap,
  createFavoriteMap: createFavoriteMap,
  createLikeMap: createLikeMap,
  createLikeCountMap: createLikeCountMap,
  isMine: isMine
};