'use strict';
const express = require('express');
const router = express.Router();
const util = require('./util.js');
const loader = require('../models/sequelize-loader');
const sequelize = loader.database;
const Game = require('../models/game');
const Stage = require('../models/stage');
const Favorite = require('../models/favorite');
const Like = require('../models/like');
const Comment = require('../models/comment');

router.get('/', authenticationEnsurer, csrfProtection, (req, res, next) => {
  res.render('contact', {
    user: req.user,
    csrfToken: req.csrfToken()
  });
});

router.post('/', authenticationEnsurer, csrfProtection, (req, res, next) => {

});

module.exports = router;