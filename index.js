   var eejs = require('ep_etherpad-lite/node/eejs/'),
        ERR = require("ep_etherpad-lite/node_modules/async-stacktrace"),
      async = require('ep_etherpad-lite/node_modules/async'),
    express = require('ep_etherpad-lite/node_modules/express'),
    socketio;

exports.socketio = function(hook_name, args, cb){
  socketio = args.io;
}

exports.eejsBlock_adminMenu = function(hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_message_all/templates/admin/adminMenuEntry.ejs");
  return cb();
}

exports.registerRoute = function (hook_name, args, cb) {
  args.app.get('/admin/message_to_all', function(req, res) {
    var message = req.query.message;
    var clients;
    if (socketio.sockets.clients) {
      clients = socketio.sockets.clients();
    } else {
      clients = socketio.sockets.adapter.nsp.connected;
    }
    
    async.series([
      function(callback){
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
        }
        callback();
      },
      function(callback){
        var render_args = {
          message: message,
          users: Object.keys(clients).length
        };
        res.send( eejs.require("ep_message_all/templates/admin/shout.html", render_args) );
        callback();
      }
    ]);
  });
};
