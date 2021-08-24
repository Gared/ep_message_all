'use strict'

const eejs = require('ep_etherpad-lite/node/eejs/');
const async = require('ep_etherpad-lite/node_modules/async');
const settings = require('ep_etherpad-lite/node/utils/Settings');
let socketio;

const defaultMessageText = "The server is going down for maintenance now. You may experience connection issues during that time.\nPlease be patient until the server is restarted.";
const showMessageTime = settings.ep_message_all_show_message_time || 1000 * 60 * 5;
let lastMessage = {
  message: null,
  timestamp: null
}

function sendMessage(client, message, timestamp) {
  let messageObject = {
    type: "COLLABROOM",
    data: {
      type: "shoutMessage",
      payload: {
        message: message,
        timestamp: timestamp
      }
    }
  };

  if (client.json) {
    client.json.send(messageObject);
  } else {
    client.send(messageObject);
  }
}

exports.socketio = function(hook_name, {io}, cb) {
  socketio = io;
  return cb();
}

exports.handleMessage = async (hookName, {message, socket}) => {
  if (message.type === 'CLIENT_READY' && lastMessage.timestamp && lastMessage.timestamp > Date.now() - showMessageTime) {
    setTimeout(function () {
      sendMessage(socket, lastMessage.message, lastMessage.timestamp)
    }, 2000);
  }
};

exports.eejsBlock_adminMenu = function(hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_message_all/templates/admin/adminMenuEntry.ejs");
  return cb();
}

exports.registerRoute = function (hook_name, args, cb) {
  args.app.get('/admin/message_to_all', function(req, res) {
    let message = req.query.messageText;
    let clients = socketio.sockets.sockets || socketio.sockets.adapter.nsp.connected || socketio.sockets.clients();
    let status = null;
    
    async.series([
      function(callback) {
        if (message && message !== "") {

          for (let client in clients) {
            sendMessage(clients[client], message, Date.now())
          }
          lastMessage.timestamp = Date.now();
          lastMessage.message = message;

          status = "Message sent!";
        }

        callback();
      },
      function(callback) {
        let render_args = {
          message: message || settings.ep_message_all_default_message || defaultMessageText,
          users: Object.keys(clients).length,
          status: status
        };
        res.send( eejs.require("ep_message_all/templates/admin/shout.html", render_args) );
        callback();
      }
    ]).catch(err => {
      console.error(err);
    });
  });

  return cb();
};
