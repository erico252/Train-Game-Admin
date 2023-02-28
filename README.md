# OpenTTD

OpenTTD is a transport style game where the goal is to create a company that transports teh most goods to
various industry. The income your company generates is based on diffrent factors. Goods can be trasnported using various methods via Air, Water, Land. OpenTTD can be played in a co-operative or competetive scenario
and can also include various diffrent mods to enhance graphics or change gameplay

# What is this Project?

This Project aims to make use of the (Admin Port)[https://github.com/OpenTTD/OpenTTD/blob/master/docs/admin_network.md] that is provided by the OpenTTDServer. By accessing the Admin Port we are able to requeset data on our players, their companys, as well as chat and commands being used by the server! This provides an interesting oppurtunity where we can collect large amounts of data on various OpenTTD games as well as control the servers remotley(autonomously/via discord)

# How do i use this Project?

This project runs off of Node to implement the API that connects to the admin port. This is located in `AdminPort\API\ExpressServer.js`. From here you can either use the API as a standalone or you can also boot up the web interface found in `AdminPort\WebApp\app.js`. In htefuture there will also be avaiability to connect a Discord Bot to your Discord servers to access the API as well

## Enable Admin Port

To enable the admin port it is important that in ```openttd.cfg``` (normally found in ```C:\Users\Eric\Documents\OpenTTD\openttd.cfg```) under the network category that the follwoingis added ```admin_password = Eric```. You can confirm that the admin port is opend by looking at the server interface and watching for ```dbg: [net] [tcp] listening on IPv4 port 0.0.0.0:3977 (IPv4)```

The admin port now lives in ```C:\Users\Eric\Documents\OpenTTD\secrets.cfg``` as well
