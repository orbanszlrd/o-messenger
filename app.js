const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');

const app = express();

const http = require('http').Server(app);

const Message = require('./models/Message');

require('./config/passport')(passport);

const PORT = process.env.PORT || 5256;
const MONGO_URI = process.env.MONGO_URI ?? '';
const SESSION_SECRET = process.env.SESSION_SECRET ?? '';

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.log(err));

app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.use(express.urlencoded({ extended: false }));

const session = require('express-session')({
  secret: SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
});

app.use(session);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', require('./routes/index'));
app.use('/chat', require('./routes/chat'));
app.use('/users', require('./routes/users'));

const io = require('socket.io')(http);

const sharedsession = require('express-socket.io-session');

var users = [];

const chat = io.of('/chat').on('connection', function (socket) {
  if (typeof socket.handshake.session == 'undefined') {
    console.log('No session available.');
  } else {
    if (typeof socket.handshake.session.passport == 'undefined') {
      console.log('Unautorized.');

      socket.emit('disconnected');
      return false;
    } else {
      if (typeof socket.handshake.session.passport.user == 'undefined') {
        console.log('No user.');
      }
    }
  }

  console.log('a user connected');

  socket.on('chat-auth', function (username) {
    console.log(username + ' is now connected');

    const data = {
      username: username,
      clientid: socket.client.id,
      socketid: socket.id,
    };
    users.push(data);

    let usernames = [];

    for (const i in users) {
      if (!usernames.includes(users[i].username)) {
        usernames.push(users[i].username);
      }
    }

    chat.emit('online-users', usernames);
  });

  socket.on('chat-message', function (msg) {
    const newMessage = new Message({
      sender: msg.sender,
      receiver: msg.receiver,
      message: msg.message,
    });
    newMessage.save();

    socket.emit('chat-message', msg);

    for (const i in users) {
      if (
        users[i].username == msg.receiver ||
        users[i].username == msg.sender
      ) {
        socket.broadcast.to(users[i].socketid).emit('chat-message', msg);
      }
    }
  });

  socket.on('disconnect', function () {
    for (const i in users) {
      if (users[i].socketid == socket.id) {
        console.log('user disconnected: ' + users[i].username);

        users.splice(i, 1);
      }
    }

    let usernames = [];

    for (const i in users) {
      if (!usernames.includes(users[i].username)) {
        usernames.push(users[i].username);
      }
    }
    chat.emit('online-users', usernames);
  });
});

chat.use(
  sharedsession(session, {
    autoSave: true,
  })
);

http.listen(PORT, console.log(`Server started on port ${PORT}`));
