'use strict';
const $ = require('jquery');
const global = Function('return this;')();
global.jQuery = $;
const bootstrap = require('bootstrap');

$('[data-toggle="tooltip"]').tooltip();

$('#playGame').each((i, e) => {
  const playGame = $(e)
  playGame.click(() => {
    const stageArray = playGame.data('stages');
    console.log(stageArray);
  });
});