'use strict';
const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('contact', { user: req.user });
});

module.exports = router;