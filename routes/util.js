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


module.exports = {
  createGameMap: createGameMap,
  createFavoriteMap: createFavoriteMap,
  createLikeMap: createLikeMap,
  createLikeCountMap: createLikeCountMap
};