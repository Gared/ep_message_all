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
    async.series([
      function(callback){
        if (message && message != "") {
          var clients = socketio.sockets.adapter.nsp.connected;
          for(var client in clients) {
            clients[client].send({type: "COLLABROOM",
              data:{
                type: "shoutMessage",
                payload:{
                  message: message
                }
              }
            });
          }
        }
        callback();
      },
      function(callback){
        var render_args = {
          message: message,
          users: Object.keys(socketio.sockets.adapter.nsp.connected).length
        };
        res.send( eejs.require("ep_message_all/templates/admin/shout.html", render_args) );
        callback();
      }
    ]);
  });
};
