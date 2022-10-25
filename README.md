# Admin Port

OpenTTD has access to something they call the admin port. The admin port can be used to run various commands and gather inforation programatically, for more info please see (Admin Port)[https://github.com/OpenTTD/OpenTTD/blob/master/docs/admin_network.md]

### Enable Admin Port

To enable the admin port it is important that in ```openttd.cfg``` (normally found in ```C:\Users\Eric\Documents\OpenTTD\openttd.cfg```) under the network category that the follwoingis added ```admin_password = Eric```. You can confirm that the admin port is opend by looking at the server interface and watching for ```dbg: [net] [tcp] listening on IPv4 port 0.0.0.0:3977 (IPv4)```

## TCP And UDP

we will need to understand TCP and UDP packets for this to work, construct them from scratch, send, receive.

we can follow pythons (socket)[https://docs.python.org/3/library/socket.html] documentation

## Integrate with Discord Bot

It would be cool to as an end goal send commands from discord to control the server3