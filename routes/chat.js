const express = require('express');
const router = express.Router();

const { ensureAuthenticated } = require('../config/auth');

const User = require('../models/User');

const Message = require('../models/Message');

router.get('/*', ensureAuthenticated, (req, res) => {
  let receiver = { name: req.params[0] };

  Promise.all([
    User.find({ name: { $ne: req.user.name } })
      .then((users) => {
        let usernames = [];

        users.forEach((user, id) => {
          usernames[id] = user.name;
        });

        return usernames;
      })
      .catch((err) => console.log(err)),
    Message.find({
      $or: [
        { sender: req.user.name, receiver: req.params[0] },
        { sender: req.params[0], receiver: req.user.name },
      ],
    }).catch((err) => console.log(err)),
    ,
  ])
    .then(([users, messages]) => {
      res.render('chat', {
        user: req.user,
        users: users,
        receiver: receiver,
        messages: messages,
      });
    })
    .catch((err) => console.log(err));
});

module.exports = router;
