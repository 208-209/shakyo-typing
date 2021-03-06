'use strict';
const $ = require('jquery');
const playGame = $('#playGame');

playGame.click(() => {
  const modalTitle = $('.modalTitle');
  const startMessage = $('.startMessage');
  const title = $('.title');
  const content = $('.content');
  const correctInfo = $('.correct');
  const missInfo = $('.miss');
  const timerInfo = $('.timerInfo');

  const replayBtn = $('.replayBtn');
  const missBtn = $('.missBtn');
  const closeBtnbtn = $('.closeBtnbtn');

  const modalStart = $('.modalStart');
  const modalPlaying = $('.modalPlaying');
  const modalResult = $('.modalResult');

  const validLetter = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '^', '\\',
    '!', '"', '#', '$', '%', '&', "'", '(', ')', '=', '~', '|',
    'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '@', '[',
    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '`', '{',
    'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', ':', ']',
    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '+', '*', '}',
    'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '\\',
    'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', '_', '\n'];

  const dataGame = playGame.data('game');
  const dataStages = playGame.data('stages');
  const missStages = new Map();
  const orderStages = new Map();
  let stages = dataStages;

  let stageNumber;
  let currentNumber;
  let currentTitle;
  let currentContent;
  let correct;
  let miss;
  let isMissGame;

  const COUNTDOWNTIME = 3 * 1000;
  let countDownStartTime;
  let isCountDownStarted;

  let startTime;
  let currentTime;
  let timerId;
  let isStarted;

  // タイピングの文字判定
  $(window).keypress((e) => {
    if (isStarted === false) {
      return;
    }
    if (validLetter.indexOf(currentContent[currentNumber]) === -1 && e.which === 32) { // 有効な文字以外はスペースキー(32)
      currentNumber++;
      nextStage();
      isTarget();
    } else if (currentContent[currentNumber] === '\n' && e.which === 13) { // 改行コード(\n)の場合はエンターキー(13)
      currentNumber++;
      nextStage();
      isTarget();
    } else if (String.fromCharCode(e.which) === currentContent[currentNumber]) { // 正解の場合
      currentNumber++;
      correct++;
      correctInfo.text(correct);
      nextStage();
      isTarget();
      orderStages.set(currentTitle, currentContent);
    } else { // ミスの場合
      miss++;
      missInfo.text(miss);
      missStages.set(currentTitle, currentContent);
    }
  });

  // スペースキーでカウントダウンスタート
  $(window).keypress((e) => {
    if (e.which === 32 && isCountDownStarted === false && isStarted === false) {
      countDownStartTime = Date.now();
      startCountDown();
      $('.isKey').removeClass('isKey');
    }
  });

  replayBtn.click(() => {
    stages = dataStages;
    init();
  });

  missBtn.click(() => {
    stages = Array.from(missStages);
    init();
    isMissGame = true;
  });

  closeBtnbtn.click(() => {
    stages = dataStages;
    init();
  });

  function startCountDown() {
    isCountDownStarted = true;
    let countDownTimerId = setTimeout(() => {
      let timeLeft = COUNTDOWNTIME - (Date.now() - countDownStartTime);
      if (timeLeft < 0) {
        clearTimeout(countDownTimerId);
        startTime = Date.now();
        isStarted = true;
        setStage();
        countUp();
        return;
      }
      startMessage.text(Math.ceil(timeLeft / 1000))
      startCountDown();
    }, 10);
  }

  function countUp() {
    timerId = setTimeout(() => {
      currentTime = Date.now() - startTime;
      countUp();
      updateTimerText();
    }, 10);
  }

  function updateTimerText() {
    let t = new Date(currentTime);
    let m = t.getMinutes();
    let s = t.getSeconds();
    let ms = t.getMilliseconds();
    m = ('0' + m).slice(-2);
    s = ('0' + s).slice(-2);
    ms = ('00' + ms).slice(-3);
    let timerString = parseInt(m) ? m + ' : ' + s + ' . ' + ms : s + ' . ' + ms;
    timerInfo.text(timerString);
  }

  function setStage() {
    modalStart.hide();
    modalPlaying.show();
    modalResult.hide();
    currentTitle = isMissGame ? stages[stageNumber][0] : stages[stageNumber]['stageTitle'];
    currentContent = isMissGame ? stages[stageNumber][1] : stages[stageNumber]['stageContent'];
    currentContent = currentContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n'); // 改行文字コードを'\n'に統一
    title.text(currentTitle);
    content.text(currentContent);
    correctInfo.text(correct);
    missInfo.text(miss);
    currentNumber = 0;
    isTarget();
  }

  function isTarget() {
    $('.isKey').removeClass('isKey');
    // キーボードのターゲット
    if (validLetter.indexOf(currentContent[currentNumber]) === -1) {
      $('.key_space').addClass('isKey'); // 有効な文字以外はスペースキー
    } else if (currentContent[currentNumber] === '\n') {
      $('.key_enter').addClass('isKey'); // '\n'のときはエンターキー
    } else {
      const currentKeyCode = currentContent[currentNumber] ? currentContent[currentNumber].charCodeAt() : '';
      $('.key_' + currentKeyCode).addClass('isKey');
    }
    // 文字のターゲット
    const beforeTarget = currentContent.substring(0, currentNumber);
    const currentTarget = currentContent[currentNumber];
    const afterTarget = currentContent.substring(currentNumber + 1);
    const escapeBeforeTarget = beforeTarget ? escapeLetter(beforeTarget) : '';
    const escapeCurrentTarget = currentTarget ? escapeLetter(currentTarget) : '';
    const escapeAfterTarget = afterTarget ? escapeLetter(afterTarget) : '';

    content.html('<span>' + escapeBeforeTarget + '</span><span class="currentTarget">' + escapeCurrentTarget + '</span><span>' + escapeAfterTarget + '</span>');
    $('.currentTarget').addClass('isKey');
  }

  // XSS対策で「'」「"」「<」「>」を文字参照にする
  function escapeLetter(letter) {
    return letter.replace(/'/g, '&apos;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function nextStage() {
    if (stageNumber === stages.length - 1 && currentNumber === currentContent.length) {
      clearTimeout(timerId); // 最後のステージで 最後の文字が正解の場合は リザルト画面へ
      result();
    } else if (currentNumber === currentContent.length) {
      stageNumber++; // 途中のステージで 最後の文字が正解の場合は 次のステージへ
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
    orderStages.clear();
    isCountDownStarted = false;
    isStarted = false;
    isMissGame = false;
    shuffle(stages);
    modalTitle.text(dataGame);
    startMessage.text('スペースキーで開始します');

    $('.isKey').removeClass('isKey');
    $('.key_space').addClass('isKey');
    $('.order').remove();
    $('.twitter-hashtag-button').remove();
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

  function result() {
    modalStart.hide();
    modalPlaying.hide();
    modalResult.show();
    missStages.size ? missBtn.show() : missBtn.hide(); // ミスが無かったらボタンを非表示
    const accuracy = (correct + miss) === 0 ? '0.00' : (correct / (correct + miss));
    const WPM = ((correct + miss) / (currentTime / 1000) * 60).toFixed(2);
    const score = Math.round((WPM * Math.pow(accuracy, 3)));

    const t = new Date(currentTime);
    const m = t.getMinutes();
    const s = t.getSeconds();
    const resultTimer = parseInt(m) ? m + '分' + s + '秒' : s + '秒';
    const tweet = dataGame + ' の結果は、スコア「 ' + score + '」の「' + determine(score).level + '」ランクでした。\nhttps://www.shakyo-typing.com';

    modalTitle.text(dataGame + ' の結果');
    $('.resultScore').text(score);
    $('.resultLevel').text(determine(score).level);
    $('.resultAnimal').text(determine(score).animal);
    $('.resultTime').text(resultTimer);
    $('.resultCorrect').text(correct);
    $('.resultMiss').text(miss);
    $('.resultWpm').text(WPM);
    $('.resultAccuracy').text((accuracy * 100).toFixed(0) + '%');

    $('.order').remove();
    $('.twitter-hashtag-button').remove();
    createOrderStages(orderStages);
    createTwitterBtn(tweet);
    twttr.widgets.load();
  }

  function determine(score) {
    if (400 <= score) {
      return { 'level': 'SSS', 'animal': 'チーター' };
    } else if (300 <= score && score < 400) {
      return { 'level': 'SS', 'animal': 'トムソンガゼル' };
    } else if (250 <= score && score < 300) {
      return { 'level': 'S', 'animal': 'オオカミ' };
    } else if (200 <= score && score < 250) {
      return { 'level': 'A', 'animal': 'ライオン' };
    } else if (150 <= score && score < 200) {
      return { 'level': 'B', 'animal': 'キリン' };
    } else if (100 <= score && score < 150) {
      return { 'level': 'C', 'animal': 'イノシシ' };
    } else if (50 <= score && score < 100) {
      return { 'level': 'D', 'animal': 'ゾウ' };
    } else if (0 <= score && score < 50) {
      return { 'level': 'E', 'animal': 'コアラ' };
    }
  }

  // 結果にステージ一覧を表示
  function createOrderStages(orderStages) {
    const stages = Array.from(orderStages);
    stages.forEach((stage) => {
      const stageTitle = escapeLetter(stage[0]);
      const stageContent = escapeLetter(stage[1]);
      const content = $('<pre>').addClass('panelContent prettyprint').append(stageContent)
      $('<div>').addClass('panel-heading order').append(stageTitle).appendTo('.stageList');
      $('<div>').addClass('panel-body order').append(content).appendTo('.stageList');
    });
  }

  // 結果にツイッターボタンを表示
  function createTwitterBtn(result) {
    $('<a>').attr({
      href: 'https://twitter.com/intent/tweet?button_hashtag=' + encodeURIComponent('写経タイピング') + '&ref_src=twsrc%5Etfw',
      class: 'twitter-hashtag-button',
      'data-text': result,
      'data-lang': 'ja',
      'data-show-count': 'false'
    }).appendTo('.modal-footer');
  }

  init();
});
