exports.handleClientMessage_shoutMessage = function(hook, context){
  
  $.gritter.add({
    // (string | mandatory) the heading of the notification
    title: 'Admin Message',
    // (string | mandatory) the text inside the notification
    text: context.payload.message,
    // (bool | optional) if you want it to fade out on its own or just sit there
    sticky: true
  });
  
} 
