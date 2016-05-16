   var eejs = require('ep_etherpad-lite/node/eejs/'),
        ERR = require("ep_etherpad-lite/node_modules/async-stacktrace"),
      async = require('ep_etherpad-lite/node_modules/async'),
    express = require('ep_etherpad-lite/node_modules/express'),
   settings = require('ep_etherpad-lite/node/utils/Settings'),
    socketio;
    
var defaultMessageText = "The server is going down for maintenance now. You may experience connection issues during that time.\nPlease be patient until the server is restarted.";

exports.socketio = function(hook_name, args, cb){
  socketio = args.io;
}

exports.eejsBlock_adminMenu = function(hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_message_all/templates/admin/adminMenuEntry.ejs");
  return cb();
}

exports.registerRoute = function (hook_name, args, cb) {
  args.app.get('/admin/message_to_all', function(req, res) {
    var message = req.query.messageText;
    var clients = socketio.sockets.sockets || socketio.sockets.adapter.nsp.connected || socketio.sockets.clients();
    var status = null;
    
    async.series([
      function(callback) {
        if (message && message != "") {
          var messageObject = {type: "COLLABROOM",
            data:{
              type: "shoutMessage",
              payload:{
                message: message
              }
            }
          };
          
          for (var client in clients) {
            if (clients[client].json) {
              clients[client].json.send(messageObject);
            } else {
              clients[client].send(messageObject);
            }
          }
          status = "Message sent!";
        }
        callback();
      },
      function(callback) {
        var render_args = {
          message: message || settings.ep_message_all_default_message || defaultMessageText,
          users: Object.keys(clients).length,
          status: status
        };
        res.send( eejs.require("ep_message_all/templates/admin/shout.html", render_args) );
        callback();
      }
    ]);
  });
};
