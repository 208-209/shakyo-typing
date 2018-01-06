'use strict';

function createGameMap(games) {
  const gameMap = new Map();
  games.forEach((g) => {
    gameMap.set(g.gameId, g.stages);
  });
  return gameMap;
}

function createFavoriteMap(favorites) {
  const favoriteMap = new Map();
  favorites.forEach((f) => {
    favoriteMap.set(f.gameId, f.favorite);
  });
  return favoriteMap;
}

function ensure(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

module.exports = {
  ensure: ensure,
  createGameMap: createGameMap,
  createFavoriteMap: createFavoriteMap
};