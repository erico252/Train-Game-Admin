# API

Here all the information on the APIs processes and its endpoints are found. Within in this folder we acomplish 3 main tasks
- Create Packets tp send to Admin Port
- Decode Packets that are read from Admin Port
- Create Endpoints for infomration to be Read/Written from
It should be noted that the defintion for all packets that can be read/written to the server are documented (In the OpenTTD Github)[https://github.com/OpenTTD/OpenTTD/blob/master/src/network/core/tcp_admin.h]

## Creating Packets

The packet creation is mostly found in `.\src\AdminPortAPI.ts\`. Here we create 3 main packets.
- `AdminJoin`
- `Poll`
- `Update`

### Admin Join

The admin join packet is the first thing that is done when a connection is requested. The Admin Join packet needs 3 things in it, The Conneciton/Bots name, the password for the AdminPort, and the Connection/Bots version. This is documented in the `createAdminJoin()` function

### Poll

The Poll packet is used to instantaneously ask for data from the server. The poll packet will take an update type as documented (In the OpenTTD Github)[https://github.com/OpenTTD/OpenTTD/blob/master/src/network/core/tcp_admin.h] as well as a company/client ID. This way we can ask for data on an indivdual. We can also ask for all data by sending UINT32MAX as the company/client ID

### Update

The Update packet is much like the poll packet however it differs in the fact that it does not send a comany/client ID and instead sends a frequency. This frequecny will tell the serrver how often to send the specefied update. When it comes to Client/Company updates it can only send infomration on all at once and does not have the fine tunning that poll does

## Decoding Packets

Decoding Packets is where the fun begins! There are a total of 27 diffrent packet types that we can receive form the adminport conneciton that need to be decoded. These 27 diffrent types are documented (In the OpenTTD Github)[https://github.com/OpenTTD/OpenTTD/blob/master/src/network/core/tcp_admin.h] and all begin with `ADMIN_PACKET_SERVER_`. All the logic behind decoding incomming packets can be found in `.\src\PacketFunctions.ts`. Lets look at an exmaple from the docs and see how we can decode it!

### Example Decoding ADMIN_PACKET_SERVER_CLIENT_INFO

All Packets that are sent to and are arriving form the admin port follow the same desing pattern. `0xSIZE 0xSIZE 0xTYPE 0xPAYLOAD` (where `0x__` is indicating that it is a byte of data in hex). First we will find the aboslute size of the packet and its type. From its type we know that we do indeed have a `ADMIN_PACKET_SERVER_CLIENT_INFO` packet!. Now all that we have left is the `0xPAYLOAD` to deal with. Since we know the type we can go look for its definition in the openTTD docs!

From the docs we can scroll down to find where our packet is defined. For this specific packet the definition looks like this
```
/**
	 * Client information of a specific client:
	 * uint32  ID of the client.
	 * string  Network address of the client.
	 * string  Name of the client.
	 * uint8   Language of the client.
	 * uint32  Date the client joined the game.
	 * uint8   ID of the company the client is playing as (255 for spectators).
	 * @param p The packet that was just received.
	 * @return The state the network should have.
	 */
	virtual NetworkRecvStatus Receive_SERVER_CLIENT_INFO(Packet *p);
```
This is super usefull for us! it tells us exactly what information will be sent with the packet and the lenght of each section. From this definition we can start to piece together what the shape of our packet is, lets try that now!
`0xID 0xID 0xID 0xID` Notice that our first value is the ID of the client and 

it takes up 32bits of information, this is represented by 4 hex values! lets look at the next value...

`0xADDR 0xADDR 0xADDR 0xADDR 0xADDR 0xADDR.....` Hold on a second, the previous value told us that it was a `UINT32` thus letting us know that it was 4bytes of hex. This one just says string! how are we supposed to  read that?! 

From the Admin when strings are involved its takes for form of `0xSTRING 0xSTRING 0xSTRING 0xSTRING 0x00` where the `0x00` indicates the end of the string! we can use this to our advantage when reading the values. For now lets continue planning out the structure of this incoming packet.

Using all our new found knowledge we can say the packet structure looks somehting like this... `0xID 0xID 0xID 0xID 0xADDR 0x00 0xNAME 0x00 0xLANG 0xDATE 0xDATE 0xDATE 0xDATE 0xCOMPANYID`

Now that we knwo the structure we can easily create a function for this specfic type of packet and decode it acocridngly!


### Take aways

All of the packets are decoded in  the same fashion as described above. Each of their fucntions can be examined in `.\src\PacketFunctions.ts`

## Creating Endpoints

Now that we can send and receive packets we need a way to be able to access these fucntions over the web. Thisis where the Express server and the API Endpoints come in to play. We have 2 categories of endpoints currently
- `/socket`
- `/server`

### /socket Endpoints
TODO: add Endpoint formatting
- METHOD
- BODY

#### /socket/
Show Info text

#### /socket/list
List All Connections

#### /socket/connect
Make a connection

#### /socket/:ID/disconnect
close the connection of the socket with id :ID

#### /socket:ID/error
Unused currently

### /server Endpoints

#### /server/
Show Info Text

#### /server/list
List all servers

#### /server/:ID
Get data from server with id :ID

#### /server/:ID/companies
List all companies on server with id :ID

#### /server/:ID/clients
List all clients on server with id :ID

#### /server/:ID/query
Create and Update request on server with id :ID

#### /server/:ID/poll
Poll for data on server with id :ID