const express = require('express');
const router = express.Router();

// Index Page
router.get('/', (req, res) => {
  // Is logged in, redirect to Dashboard
  if (req.user == undefined) {
    res.render('index');
  } else {
    console.log('loggen in');
    req.flash('error_msg', 'You are already logged in');
    res.redirect('/chat');
  }
});

module.exports = router;
