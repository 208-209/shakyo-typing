'use strict';
const $ = require('jquery');

// AJAXによるfavoriteの更新
$('.favorite-toggle-button').each((i, e) => {
  const button = $(e);
  button.click(() => {
    const userId = button.data('user-id');
    const gameId = button.data('game-id');
    const favorite = parseInt(button.data('favorite'));
    const nextFavorite = (favorite + 1) % 2;

    $.post(`/users/${userId}/games/${gameId}/favorite`,
      { favorite: nextFavorite },
      (data) => {
        button.data('favorite', data.favorite);
        const buttonStyles = ['fa-star-o', 'fa-star'];
        button.removeClass('fa-star-o', 'fa-star');
        button.addClass(buttonStyles[data.favorite]);
      });
  });
});

// AJAXによるlikeの更新
$('.like-toggle-button').each((i, e) => {
  const button = $(e);
  button.click(() => {
    const userId = button.data('user-id');
    const gameId = button.data('game-id');
    const like = parseInt(button.data('like'));
    const nextLike = (like + 1) % 2;

    $.post(`/users/${userId}/games/${gameId}/like`,
      { like: nextLike },
      (data) => {
        button.data('like', data.like);
        button.next().text(data.likeCount);
        const buttonStyles = ['fa-heart-o', 'fa-heart'];
        button.removeClass('fa-heart-o', 'fa-heart');
        button.addClass(buttonStyles[data.like]);
      });
  });
});
