var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var session = require('express-session');
var passport = require('passport');
var config = require('./config');

// モデルの読み込み
var User = require('./models/user');
var Game = require('./models/game');
var Stage = require('./models/stage');
var Favorite = require('./models/favorite');
var Comment = require('./models/comment');
var Like = require('./models/like');
User.sync().then(() => {
  Game.belongsTo(User, { foreignKey: 'createdBy' });
  Game.sync().then(() => {
    Game.hasMany(Stage, { foreignKey: 'gameId' });
    Stage.sync();
    Game.hasMany(Favorite, { foreignKey: 'gameId' });
    Favorite.sync();
    Game.hasMany(Comment, { foreignKey: 'gameId' });
    Comment.belongsTo(User, { foreignKey: 'postedBy' });
    Comment.sync();
    Like.sync();
  });
});

var GoogleStrategy = require('passport-google-oauth20').Strategy;
var GOOGLE_CLIENT_ID = config.google.clientId;
var GOOGLE_CLIENT_SECRET = config.google.clientSecret;

var TwitterStrategy = require('passport-twitter').Strategy;
var TWITTER_CONSUMER_KEY = config.twitter.consumerKey;
var TWITTER_CONSUMER_SECRET = config.twitter.consumerSecret;

var GitHubStrategy = require('passport-github2').Strategy;
var GITHUB_CLIENT_ID = config.github.clientId;
var GITHUB_CLIENT_SECRET = config.github.clientSecret;

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:8000/auth/google/callback'
},
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      User.upsert({
        userId: profile.id,
        username: profile.displayName,
        image: profile.photos[0].value
      }).then(() => {
        done(null, profile);
      });
    });
  }
));

passport.use(new TwitterStrategy({
  consumerKey: TWITTER_CONSUMER_KEY,
  consumerSecret: TWITTER_CONSUMER_SECRET,
  callbackURL: 'http://localhost:8000/auth/twitter/callback'
},
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      User.upsert({
        userId: profile.id,
        username: profile.username,
        image: profile.photos[0].value
      }).then(() => {
        done(null, profile);
      });
    });
  }
));

passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:8000/auth/github/callback'
},
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      User.upsert({
        userId: profile.id,
        username: profile.username,
        image: profile._json.avatar_url
      }).then(() => {
        done(null, profile);
      });
    });
  }
));

var routes = require('./routes/index');
var users = require('./routes/users');
var games = require('./routes/games');
var stages = require('./routes/stages');
var favorites = require('./routes/favorites');
var likes = require('./routes/likes');
var tags = require('./routes/tags');
var search = require('./routes/search');
var others = require('./routes/others');
var comments = require('./routes/comments');
var login = require('./routes/login');
var logout = require('./routes/logout');

var app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'ad2bbe6c91fd1c2d', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/games', games);
app.use('/games', stages);
app.use('/games', comments);
app.use('/games', tags);
app.use('/games', search);
app.use('/games', others);
app.use('/users', users);
app.use('/users', favorites);
app.use('/users', likes);
app.use('/login', login);
app.use('/logout', logout);

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }),
  function (req, res) {
  });

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    var loginFrom = req.cookies.loginFrom;
    // オープンリダイレクタ脆弱性対策
    if (loginFrom && loginFrom.indexOf('http://') < 0 && loginFrom.indexOf('https://') < 0) {
      res.clearCookie('loginFrom');
      res.redirect(loginFrom);
    } else {
      res.redirect('/');
    }
  });

app.get('/auth/twitter',
  passport.authenticate('twitter'),
  function (req, res) {
  });

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function (req, res) {
    var loginFrom = req.cookies.loginFrom;
    // オープンリダイレクタ脆弱性対策
    if (loginFrom && loginFrom.indexOf('http://') < 0 && loginFrom.indexOf('https://') < 0) {
      res.clearCookie('loginFrom');
      res.redirect(loginFrom);
    } else {
      res.redirect('/');
    }
  });

app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }),
  function (req, res) {
  });

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
    var loginFrom = req.cookies.loginFrom;
    // オープンリダイレクタ脆弱性対策
    if (loginFrom && loginFrom.indexOf('http://') < 0 && loginFrom.indexOf('https://') < 0) {
      res.clearCookie('loginFrom');
      res.redirect(loginFrom);
    } else {
      res.redirect('/');
    }
  });

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;