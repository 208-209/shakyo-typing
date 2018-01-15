'use strict';
const $ = require('jquery');
const global = Function('return this;')();
global.jQuery = $;
const bootstrap = require('bootstrap');

// Bootstrapツールチップ
$('[data-toggle="tooltip"]').tooltip();

// 編集メニューでのプライバシーの自動選択
const privacy = $('#editPrivacy').data('privacy');
$('#editPrivacy').val(privacy);

// キーボードの表示・非表示
$('.keyboardBtn').addClass('active');
$('.keyboardBtn').click(() => {
  $('.keyboardBtn').toggleClass('active');
  if ($('.keyboardBtn').hasClass('active')) {
    $('.keyboard').show()
    $('.display').css('height', '300px');
  } else {
    $('.keyboard').hide();
    $('.display').css('height', '570px');
  }
});
