/* eslint-env browser */

import { io } from 'socket.io-client';

export default function () {
  var oSender;
  var oReceiver;
  var oMessageInput;
  var oUserList;
  var oMessageList;
  var oMessageForm;
  var oMessageDiv;

  var o2Chat;

  document.addEventListener('DOMContentLoaded', function () {
    initPage();
    initChatClient();
  });

  function initChatClient() {
    o2Chat = io.connect('/chat');
    o2Chat.emit('chat-auth', oSender.value);
    o2Chat.on('online-users', onlineUsers);
    o2Chat.on('chat-message', chatMessage);
    o2Chat.on('disconnected', disconnected);
  }

  function initPage() {
    oUserList = document.getElementById('o2UserList');
    oMessageDiv = document.getElementsByClassName('o2-messages')[0];
    oMessageList = document.getElementById('o2MessageList');

    oSender = document.getElementById('o2Sender');
    oReceiver = document.getElementById('o2Receiver');
    oMessageInput = document.getElementById('o2MessageInput');
    oMessageForm = document.getElementsByTagName('form')[0];
    oMessageForm.addEventListener('submit', submitMessageForm);

    if (oReceiver.value != '') {
      oMessageDiv.classList.remove('d-none');
      oMessageList.scrollTop = oMessageList.scrollHeight;
      oMessageInput.focus();
    }
  }

  function disconnected() {
    location.href = '/users/login';
  }

  function onlineUsers(onlineusers) {
    for (let i in oUserList.children) {
      if (
        oUserList.children[i].classList &&
        oUserList.children[i].classList.contains('o2-online-user')
      ) {
        oUserList.children[i].classList.remove('o2-online-user');
      }
    }

    onlineusers.forEach(function (username) {
      if (document.getElementById('user:' + username)) {
        document
          .getElementById('user:' + username)
          .classList.add('o2-online-user');
      }
    });
  }

  function chatMessage(msg) {
    if (msg.sender == oSender.value && msg.receiver == oReceiver.value) {
      let olistItem = document.createElement('li');

      let oChildDiv = document.createElement('div');
      oChildDiv.classList.add('o2-sender-right');
      oChildDiv.innerHTML = msg.sender + ' <span class="fa fa-user"></span> ';
      olistItem.appendChild(oChildDiv);

      oChildDiv = document.createElement('div');
      oChildDiv.classList.add('o2-speech-bubble-right');
      oChildDiv.innerHTML = msg.message;
      olistItem.appendChild(oChildDiv);

      oMessageList.appendChild(olistItem);
    } else if (msg.receiver == oSender.value && msg.sender == oReceiver.value) {
      let olistItem = document.createElement('li');

      let oChildDiv = document.createElement('div');
      oChildDiv.classList.add('o2-sender-left');
      oChildDiv.innerHTML = '<span class="fa fa-user"></span> ' + msg.sender;
      olistItem.appendChild(oChildDiv);

      oChildDiv = document.createElement('div');
      oChildDiv.classList.add('o2-speech-bubble-left');
      oChildDiv.innerHTML = msg.message;
      olistItem.appendChild(oChildDiv);

      oMessageList.appendChild(olistItem);
    } else {
      // notify the user when gets a new message
      document.getElementById('user:' + msg.sender).classList.add('o2-unread');
    }

    oMessageList.scrollTop = oMessageList.scrollHeight;
  }

  function submitMessageForm(e) {
    e.preventDefault();

    if (oMessageInput.value == '') {
      oMessageInput.focus();
      return false;
    }

    var data = {};
    data.sender = oSender.value;
    data.receiver = oReceiver.value;
    data.message = oMessageInput.value;
    o2Chat.emit('chat-message', data);

    oMessageInput.value = '';
    oMessageInput.focus();
  }
}
