'use strict';
const $ = require('jquery');

// タイピングゲームの挙動
$('.playGame').each((i, e) => {
  const playGame = $(e)
  playGame.click(() => {
    const title = $('.title');
    const content = $('.content');
    const modalStart = $('.modalStart');
    const modalPlaying = $('.modalPlaying');
    const modalResult = $('.modalResult');
    const startMessage = $('.startMessage');
    const correctInfo = $('.correct');
    const missInfo = $('.miss');
    const timerInfo = $('.timer');
    const replayBtn = $('.replayBtn');
    const missBtn = $('.missBtn');
    const closeBtnbtn = $('.closeBtnbtn');

    const dataStages = playGame.data('stages');
    const missStages = new Map();
    let stages = dataStages;
    console.log(dataStages);

    const validLetter = [
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '^', '\\',
      '!', '"', '#', '$', '%', '&', "'", '(', ')', '=', '~', '|',
      'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '@', '[',
      'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '`', '{',
      'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', ':', ']',
      'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '+', '*', '}',
      'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '\\',
      'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', '_', '\r'];
    let stageNumber; // stages code letter
    let currentTitle;
    let currentContent;
    let currentNumber;
    let correct;
    let miss;
    let timer;
    let isStarted;

    const countDownTime = 3 * 1000;
    let countDownStartTime;
    let countDownTimerId;
    let startTime;
    let currentTime;
    let timerId;

    // スペースキーでスタート
    $(window).keypress((e) => {
      if (e.which === 32 && isStarted === false) {
        countDownStartTime = Date.now();
        startCountDown();
      }
    });

    // キーの判定
    $(window).keypress((e) => {
      if (isStarted === false) {
        return;
      }
      if (validLetter.indexOf(currentContent[currentNumber]) === -1 && e.which === 32) {
        currentNumber++;
        nextStage();
        isTarget();
      } else if (String.fromCharCode(e.which) === currentContent[currentNumber]) {
        currentNumber++;
        correct++;
        correctInfo.text(correct);
        nextStage();
        isTarget();
      } else {
        miss++;
        missInfo.text(miss);
        missStages.set(currentTitle, currentContent);
      }
      console.log(missStages);
      // console.log(stages);
      // console.log(currentTitle);
      // console.log(currentContent);
      console.log(String.fromCharCode(e.which) + ':' + e.which);
    });

    // もう一回
    replayBtn.click(() => {
      stages = dataStages;
      init();
    });

    // ミスだけ
    missBtn.click(() => {
      stages = Array.from(missStages);
      init();
    });

    // 閉じる
    closeBtnbtn.click(() => {
      init();
    });

    // スペースキーを押してからのカウントダウン
    function startCountDown() {
      countDownTimerId = setTimeout(() => {
        let timeLeft = countDownTime - (Date.now() - countDownStartTime);
        if (timeLeft < 0) {
          clearTimeout(countDownTimerId);
          timeLeft = 0;
          countDownStartTime = 0;
          startTime = Date.now();
          isStarted = true;
          setStage();
          countUp();
          return;
        }
        updateTimer(timeLeft);
        startCountDown();
      }, 10);
    }

    /**
     * 
     * @param {} time 
     */
    function updateTimer(time) {
      let t = new Date(time);
      let s = t.getSeconds();
      let ms = t.getMilliseconds();
      ms = ('0' + ms).slice(-2);
      let timerString = s + '.' + ms;
      startMessage.text(timerString)
    }

    // ゲームのPlay時間を計算
    function countUp() {
      timerId = setTimeout(() => {
        currentTime = Date.now() - startTime;
        countUp();
      }, 10);
    }


    function setStage() {
      modalStart.hide();
      modalPlaying.show();
      modalResult.hide();
      currentTitle = stages[stageNumber]['stageTitle'] || stages[stageNumber][0];
      currentContent = stages[stageNumber]['stageContent'] || stages[stageNumber][1];
      currentContent = currentContent.replace(/\r\n/g, '\r').replace(/\n/g, '\r');
      title.text(currentTitle);
      content.text(currentContent);
      correctInfo.text(correct);
      missInfo.text(miss);
      currentNumber = 0;
      isTarget();
    }

    function isTarget() {
      // keyのターゲット
      $('.isKey').removeClass('isKey');
      if (validLetter.indexOf(currentContent[currentNumber]) === -1) {
        $('.key_space').addClass('isKey');
      }
      const currentKeyCode = currentContent[currentNumber] ? currentContent[currentNumber].charCodeAt() : '';
      $('.key_' + currentKeyCode).addClass('isKey');
      // 文字ののターゲット
      const beforeTarget = currentContent.substring(0, currentNumber);
      const currentTarget = currentContent[currentNumber];
      const afterTarget = currentContent.substring(currentNumber + 1);
      const escapeBeforeTarget = beforeTarget ? escapeLetter(beforeTarget) : '';
      const escapeCurrentTarget = currentTarget ? escapeLetter(currentTarget) : '';
      const escapeAfterTarget = afterTarget ? escapeLetter(afterTarget) : '';

      content.html('<span>' + escapeBeforeTarget + '</span><span class="currentTarget">' + escapeCurrentTarget + '</span><span>' + escapeAfterTarget + '</span>');
      $('.currentTarget').addClass('isKey');
      console.log(currentContent[currentNumber]);
      console.log(currentKeyCode);
    }

    function escapeLetter(letter) {
      return letter.replace(/'/g, '&apos;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function nextStage() {
      // 最後のステージ で 最後の文字が正解
      if (stageNumber === stages.length - 1 && currentNumber === currentContent.length) {
        clearTimeout(timerId);
        result();
      // 途中のステージ で 最後の文字が正解
      } else if (currentNumber === currentContent.length) {
        stageNumber++;
        setStage();
      }
    }

    function init() {
      modalStart.show();
      modalPlaying.hide();
      modalResult.hide();
      stageNumber = 0;
      currentNumber = 0;
      correct = 0;
      miss = 0;
      countDownStartTime = 0;
      startTime = 0;
      missStages.clear();
      isStarted = false;
      $('.isKey').removeClass('isKey');
      startMessage.text('スペースキーで開始');
      shuffle(stages);
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
      modalStart.hide();
      modalPlaying.hide();
      modalResult.show();
      missStages.size ? missBtn.show() : missBtn.hide();
      const accuracy = (correct + miss) === 0 ? '0.00' : (correct / (correct + miss)).toFixed(2);
      const WPM = ((correct + miss) / (currentTime / 1000) * 60).toFixed(2);
      const score = (WPM * Math.pow(accuracy, 3)).toFixed(2);
      const level = determine(score);

      let t = new Date(currentTime);
      let m = t.getMinutes();
      let s = t.getSeconds();
      let ms = t.getMilliseconds();
      m = ('0' + m).slice(-2);
      s = ('0' + s).slice(-2);
      ms = ('0' + ms).slice(-2);


      $('.resultScore').text(score);
      $('.resultLevel').text(level);
      $('.resultTime').text(m + '分' + s + '秒' + ms);
      $('.resultCorrect').text(correct);
      $('.resultMiss').text(miss);
      $('.resultWpm').text(WPM);
      $('.resultAccuracy').text(accuracy * 100 + '%');
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