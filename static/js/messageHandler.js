exports.handleClientMessage_shoutMessage = function(hook, context){
  alert(context.payload.message);
}