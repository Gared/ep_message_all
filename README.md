ep_message_all
==============

This etherpad plugin adds a website to the admin backend (/admin/message_to_all) to send a message to all connected users
and to all newly connected clients within the next 5 minutes.

You can override the default settings in ```settings.json```:

Option | Description
------ | -----------
ep_message_all_default_message | Overwrite the default message
ep_message_all_show_message_time | Overwrite how long a message will be displayed to new users (default: 300000 - 5 minutes)
