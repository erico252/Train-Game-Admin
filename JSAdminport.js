//npx tsc JSAdminport.ts -w
//PRJECT DESCRIPTION
/*Now we need a way to dechiper packets

- Packstructure as the following 0xSIZE 0xSIZE 0xTYPE 0xDATA... 0xDATA

- Connect to the server on script start. This will produce a Protocol
packet and a Welcome Packet. We can store this information in
Global Variables.

- We can make endpoints that allow you to send send packets for diffrent
things. For example /OpentTTD/companies will send a packet requesting
infromation about the compnaies for the game

- We should have the responses get stored in a Global "Server" class(?)
so that the information can be accessed and changed everywhere. That way
we can have Get requests to have info populated in response and Post
requests to have info be sent to server

- What should really happen is we run 2 servers. One for the OpenTTD Bot
one for the Discord bot. They communicate via RESTful API calls
(Discrod asks OpenTTD for info via get, OpenTTD responds)

-So lets only design around accessing and transmitting data in OpenTTD
Then move on from there to websites/discord/databases/etc
*/
//--IMPORTS--
var net = require('net');
var express = require("express");
var app = express();
//--GLOBALS--
var HOST = '127.0.0.1';
var PORT = 3977;
var RawReceivedPacket;
//--INTERFACES--
//--FUNCTIONS--
function createAdminJoin(Password, BotName, Version) {
    //SIZE  SIZE 0x00 BotName 0x00 Password 0x00  Version 0x00
    var Variables = [Password, BotName, Version];
    var Packet = Buffer.from(new Uint8Array([0x00, 0x00, 0x00]));
    Variables.forEach(function (str) {
        Packet = Buffer.concat([Packet, Buffer.from(str), new Uint8Array([0x00])]);
    });
    Packet[0] = Packet.length;
    return Packet;
}
function processPacket(RawPacket) {
    var rawLength = RawPacket.length;
    var cumulativeLength = 0;
    var ActiveType;
    var ActivePacket;
    console.log("RawData:", RawPacket);
    while (cumulativeLength < rawLength) {
        //find the type of the packet, type is awlasy the 3rd value
        ActiveType = RawPacket[cumulativeLength + 2];
        //Now that we have the type we can begin to take infomation out of the packets
        ActivePacket = RawPacket.slice(cumulativeLength, cumulativeLength + RawPacket[cumulativeLength]);
        processType(ActiveType, ActivePacket.slice(3, ActivePacket.length));
        cumulativeLength = cumulativeLength + RawPacket[cumulativeLength];
    }
}
function processType(Type, data) {
    //Likely we will just need a large switch case to  deal with all of the diffrent Packets
    //This is probably easiest to do by abstractig it away in a seperate file but we will 
    //Attempt on small scale here
    switch (Type) {
        case 103: //ADMIN Protocol
            console.log(data);
            break;
        case 104:
            console.log(data);
            // Expected output: "Mangoes and papayas are $2.79 a pound."
            break;
        default:
            console.log("The Packet TYpe ".concat(Type, " is not yet accounted for"));
    }
}
//--MAIN--
//Create a socket to be used for connection
var socket = new net.Socket();
//Connect to the open and active OpenTTD Server
socket.connect(PORT, HOST, function () {
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    socket.write(createAdminJoin("Eric", "Erics Bot", "1.0"));
});
socket.on('data', function (data) {
    //everytime the socket receives data, this event is triggered
    //Everytime Event is triggered we need to process the data
    //Mulitple Packets coould arrive in single event
    //For this reason we will need to use the SIZE to seperate Packets
    RawReceivedPacket = Buffer.from(data, "hex");
    processPacket(RawReceivedPacket);
});
// Add a 'close' event handler for the client socket
socket.on('close', function () {
    console.log('Connection closed');
});
//--ROUTES--
app.get("/", function (req, res) {
    res.send("RESTful API for OpenTTD implemented via NodeJS");
});
app.get("/connect", function (req, res) {
    var data = { key: "value" };
    res.json(data);
});
app.listen("3000", function () {
    console.log("Server listening on 3000");
});
