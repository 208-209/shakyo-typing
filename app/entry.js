'use strict';
const $ = require('jquery');
const global = Function('return this;')();
global.jQuery = $;
const bootstrap = require('bootstrap');
/*
$(window).on('load', () => {
  const privacy = $('#privacy').data('privacy');
  $('#privacy').val(privacy);
  console.log(privacy);
});
*/

$('[data-toggle="tooltip"]').tooltip();

$('.playGame').each((i, e) => {
  const playGame = $(e)
  playGame.click(() => {
    const modalBody = $('.modal-body');
    const modalTitle = $('.modalTitle');
    const modalContent = $('.modalContent');
    const modalKeyboard = $('.modalKeyboard');
    const correctInfo = $('.correct');
    const missInfo = $('.miss');
    const timerInfo = $('.timer');
    const dataStages = playGame.data('stages');
    const missStages = new Map();
    let stages = dataStages;

    const validLetter = ['a', 'A', 'i', 'I', 'u', 'U', 'e', 'E', 'o', 'O'];
    let stageNumber; // stages code letter
    let currentTitle;
    let currentContent;
    let currentNumber;
    let correct;
    let miss;
    let timer;
    let isStarted;

    let startTime;
    let currentTime;
    let timerId;


    $(window).keypress((e) => {
      if (isStarted === false) {
        return;
      }
      if (validLetter.indexOf(currentContent[currentNumber]) === -1 && e.which === 32) {
        currentNumber++;
        nextStage();
        isLetter();
      } else if (String.fromCharCode(e.which) === currentContent[currentNumber]) {
        currentNumber++;
        correct++;
        correctInfo.html(correct);
        nextStage();
        isLetter();
      } else {
        miss++;
        missInfo.html(miss);
        missStages.set(currentTitle, currentContent);
      }
      console.log(missStages);
      // console.log(stages);
      // console.log(currentTitle);
      // console.log(currentContent);
      console.log(String.fromCharCode(e.which) + ':' + e.which);
    });

    $(window).keypress((e) => {
      if (e.which === 32 && isStarted === false) {
        startTime = Date.now();
        isStarted = true;
        setStage();
        countUp();
      }
    });

    $('.replayBtn').click(() => {
      stages = dataStages;
      init();
    });

    $('.missBtn').click(() => {
      stages = Array.from(missStages);
      init();
    });

    function setStage() {
      $('.modalStart').hide();
      $('.modalPlaying').show();
      $('.modalResult').hide();
      currentTitle = stages[stageNumber][0];
      currentContent = stages[stageNumber][1];
      modalTitle.html(currentTitle);
      modalContent.html(currentContent);
      currentNumber = 0;
      isLetter();
    }

    function countUp() {
      timerId = setTimeout(() => {
        currentTime = Date.now() - startTime;
        countUp();
      }, 10);
    }

    function isLetter() {
      const currentKeyCode = currentContent[currentNumber] ? currentContent[currentNumber].charCodeAt() : '';
      $('.key').removeClass('letter');
      $('.key_' + currentKeyCode).addClass('letter');
      modalContent.html(`<span>${currentContent.substring(0, currentNumber)}</span><span style="color: red">${currentContent[currentNumber]}</span><span>${currentContent.substring(currentNumber + 1)}</span>`);
      console.log(currentContent[currentNumber]);
      console.log(currentKeyCode);
    }

    function nextStage() {
      // すべての文字が正解した時の処理
      if (stageNumber === stages.length - 1 && currentNumber === currentContent.length) {
        clearTimeout(timerId);
        result();
      } else if (currentNumber === currentContent.length) {
        stageNumber++;
        setStage();
      }
    }

    function init() {
      $('.modalStart').show();
      $('.modalPlaying').hide();
      $('.modalResult').hide();
      currentContent = 'スペースキーで開始';
      stageNumber = 0;
      currentNumber = 0;
      correct = 0;
      miss = 0;
      missStages.clear();
      modalContent.html(currentContent);
      correctInfo.html(correct);
      missInfo.html(miss);
      shuffle(stages);
      isStarted = false;
    }

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        let r = Math.floor(Math.random() * (i + 1));
        let tmp = array[i];
        array[i] = array[r];
        array[r] = tmp;
      }
      return array
    }

    // スコア、レベル、入力時間、入力文字、ミス入力、WPM、正解率、苦手キー
    function result() {
      $('.modalStart').hide();
      $('.modalPlaying').hide();
      $('.modalResult').show();
      missStages.size ? $('.missBtn').show() : $('.missBtn').hide();
      const accuracy = (correct + miss) === 0 ? '0.00' : (correct / (correct + miss)).toFixed(2);
      const elapsedTime = (currentTime / 1000).toFixed(2)
      const WPM = ((correct + miss) / elapsedTime * 60).toFixed(2);
      const score = (WPM * Math.pow(accuracy, 3)).toFixed(2);
      const level = determine(score);
      const result = `スコア: ${score}<br>レベル: ${level}<br>入力時間: ${elapsedTime}<br>入力文字: ${correct}<br>ミス入力: ${miss}<br>WPM: ${WPM}<br>正解率: ${accuracy * 100}%`;
      $('.result').html(result);
    }

    function determine(score) {
      if (400 <= score) {
        return 'SSS';
      } else if (300 <= score && score < 400) {
        return 'SS';
      } else if (250 <= score && score < 300) {
        return 'S';
      } else if (200 <= score && score < 250) {
        return 'A';
      } else if (150 <= score && score < 200) {
        return 'B';
      } else if (100 <= score && score < 150) {
        return 'C';
      } else if (0 <= score && score < 100) {
        return 'D';
      }
    }
    init();
  });
});