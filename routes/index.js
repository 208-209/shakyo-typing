'use strict';
const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('login', {
    title: 'code-typing',
    user: req.user
  });
});

module.exports = router;