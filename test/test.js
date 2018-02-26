'use strict';
const request = require('supertest');
const app = require('../app');
const passportStub = require('passport-stub');
const User = require('../models/user');

describe('/login', () => {
  it('ログインのためのリンクが含まれる', (done) => {
    request(app)
      .get('/login')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/<a href="\/auth\/google"/)
      .expect(/<a href="\/auth\/twitter"/)
      .expect(/<a href="\/auth\/github"/)
      .expect(200, done);
  });
});

describe('/login', () => {
  before(() => {
    passportStub.install(app);
    passportStub.login({ username: 'testuser' });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('ログイン時はユーザー名が表示される', (done) => {
    request(app)
      .get('/login')
      .expect(/testuser/)
      .expect(200, done);
  });
});

describe('/logout', () => {
  it('/ にリダイレクトされる', (done) => {
    request(app)
      .get('/logout')
      .expect('Location', '/')
      .expect(302, done);
  });
});

/*
describe('/games', () => {
  before(() => {
    passportStub.install(app);
    passportStub.login({ id: '0', username: 'testuser', image: 'testImage' });
  });

  after(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  it('ゲームが作成でき、表示される', (done) => {
    User.upsert({ userId: '0', username: 'testuser', image: 'testImage' }).then(() => {
      request(app)
        .post('/games')
        .send({ gameName: 'テストゲーム', tags: 'タグ1\r\nタグ2', privacy: 0 })
        .expect('Location', /games/)
        .expect(302)
        .end((err, res) => {
          let createdGamePath = res.headers.location;
          request(app)
            .get(createdGamePath)
            .expect(/テストゲーム/)
            .expect(/タグ1/)
            .expect(/タグ2/)
            .expect(/非公開/)
            .expect(200)
            .end((err, res) => {
              // テストで作成したデータを削除
              let gameId = createdSchedulePath.split('/games/')[1];
              Game.findById(gameId).then((g) => { g.destroy(); });
              if (err) return done(err);
              done();
            });
        });
    });
  });
});
*/
