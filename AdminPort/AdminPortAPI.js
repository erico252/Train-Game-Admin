"use strict";
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
exports.__esModule = true;
var Packets = require("./PacketFunctions");
//--IMPORTS--
var net = require('net');
var express = require("express");
var app = express();
//--GLOBALS--
var NetworkErrorCode = {
    NETWORK_ERROR_GENERAL: 0x00,
    /* Signals from clients */
    NETWORK_ERROR_DESYNC: 0x01,
    NETWORK_ERROR_SAVEGAME_FAILED: 0x02,
    NETWORK_ERROR_CONNECTION_LOST: 0x03,
    NETWORK_ERROR_ILLEGAL_PACKET: 0x04,
    NETWORK_ERROR_NEWGRF_MISMATCH: 0x05,
    /* Signals from servers */
    NETWORK_ERROR_NOT_AUTHORIZED: 0x06,
    NETWORK_ERROR_NOT_EXPECTED: 0x07,
    NETWORK_ERROR_WRONG_REVISION: 0x08,
    NETWORK_ERROR_NAME_IN_USE: 0x09,
    NETWORK_ERROR_WRONG_PASSWORD: 0x0a,
    NETWORK_ERROR_COMPANY_MISMATCH: 0x0b,
    NETWORK_ERROR_KICKED: 0x0c,
    NETWORK_ERROR_CHEATER: 0x0d,
    NETWORK_ERROR_FULL: 0x0e,
    NETWORK_ERROR_TOO_MANY_COMMANDS: 0x0f,
    NETWORK_ERROR_TIMEOUT_PASSWORD: 0x10,
    NETWORK_ERROR_TIMEOUT_COMPUTER: 0x11,
    NETWORK_ERROR_TIMEOUT_MAP: 0x12,
    NETWORK_ERROR_TIMEOUT_JOIN: 0x13,
    NETWORK_ERROR_INVALID_CLIENT_NAME: 0x14,
    NETWORK_ERROR_END: 0x15
};
var AdminUpdateFrequency = {
    Automatic: 0x40,
    Anually: 0x20,
    Quarterly: 0x10,
    Monthly: 0x08,
    Weekly: 0x04,
    Daily: 0x02,
    Poll: 0x01
};
var AdminUpdateType = {
    Date: 0x00,
    ClientInfo: 0x01,
    CompanyInfo: 0x02,
    CompanyEcon: 0x03,
    CompanyStats: 0x04,
    Chat: 0x05,
    Console: 0x06,
    CMDNames: 0x07,
    CMDLogging: 0x08,
    GameScript: 0x09,
    End: 0x0a
};
var PacketType = {
    ADMIN_PACKET_ADMIN_JOIN: 0,
    ADMIN_PACKET_ADMIN_QUIT: 1,
    ADMIN_PACKET_ADMIN_UPDATE_FREQUENCY: 2,
    ADMIN_PACKET_ADMIN_POLL: 3,
    ADMIN_PACKET_ADMIN_CHAT: 4,
    ADMIN_PACKET_ADMIN_RCON: 5,
    ADMIN_PACKET_ADMIN_GAMESCRIPT: 6,
    ADMIN_PACKET_ADMIN_PING: 7,
    ADMIN_PACKET_ADMIN_EXTERNAL_CHAT: 8,
    ADMIN_PACKET_SERVER_FULL: 100,
    ADMIN_PACKET_SERVER_BANNED: 101,
    ADMIN_PACKET_SERVER_ERROR: 102,
    ADMIN_PACKET_SERVER_PROTOCOL: 103,
    ADMIN_PACKET_SERVER_WELCOME: 104,
    ADMIN_PACKET_SERVER_NEWGAME: 105,
    ADMIN_PACKET_SERVER_SHUTDOWN: 106,
    ADMIN_PACKET_SERVER_DATE: 107,
    ADMIN_PACKET_SERVER_CLIENT_JOIN: 108,
    ADMIN_PACKET_SERVER_CLIENT_INFO: 109,
    ADMIN_PACKET_SERVER_CLIENT_UPDATE: 110,
    ADMIN_PACKET_SERVER_CLIENT_QUIT: 111,
    ADMIN_PACKET_SERVER_CLIENT_ERROR: 112,
    ADMIN_PACKET_SERVER_COMPANY_NEW: 113,
    ADMIN_PACKET_SERVER_COMPANY_INFO: 114,
    ADMIN_PACKET_SERVER_COMPANY_UPDATE: 115,
    ADMIN_PACKET_SERVER_COMPANY_REMOVE: 116,
    ADMIN_PACKET_SERVER_COMPANY_ECONOMY: 117,
    ADMIN_PACKET_SERVER_COMPANY_STATS: 118,
    ADMIN_PACKET_SERVER_CHAT: 119,
    ADMIN_PACKET_SERVER_RCON: 120,
    ADMIN_PACKET_SERVER_CONSOLE: 121,
    ADMIN_PACKET_SERVER_CMD_NAMES: 122,
    ADMIN_PACKET_SERVER_CMD_LOGGING_OLD: 123,
    ADMIN_PACKET_SERVER_GAMESCRIPT: 124,
    ADMIN_PACKET_SERVER_RCON_END: 125,
    ADMIN_PACKET_SERVER_PONG: 126,
    ADMIN_PACKET_SERVER_CMD_LOGGING: 127,
    INVALID_ADMIN_PACKET: 255
};
var HOST = '127.0.0.1';
var PORT = 3977;
var ServerData = {
    Companies: [],
    Clients: [],
    CurrentDate: 0,
    ServerName: "",
    MapSeed: 0,
    MapLand: 0,
    MapHeight: 0,
    MapWidth: 0,
    StartDate: 0,
    ServerVersion: "",
    DedicatedFlag: false,
    MapName: ""
};
var RawReceivedPacket;
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
        ActivePacket = RawPacket.subarray(cumulativeLength, cumulativeLength + RawPacket[cumulativeLength]);
        processType(ActiveType, ActivePacket.subarray(3, ActivePacket.length));
        cumulativeLength = cumulativeLength + RawPacket[cumulativeLength];
    }
}
function processType(Type, data) {
    //Likely we will just need a large switch case to  deal with all of the diffrent Packets
    //This is probably easiest to do by abstractig it away in a seperate file but we will 
    //Attempt on small scale here
    var i = 0;
    var j = 0;
    var nextData = data;
    var currentData;
    switch (Type) {
        case PacketType.ADMIN_PACKET_ADMIN_JOIN:
            console.log(data, "ADMIN_JOIN");
            break;
        case PacketType.ADMIN_PACKET_ADMIN_QUIT:
            console.log(data, "ADMIN_QUIT");
            break;
        case PacketType.ADMIN_PACKET_ADMIN_UPDATE_FREQUENCY:
            console.log(data, "ADMIN_UPDATE_FREQUENCY");
            break;
        case PacketType.ADMIN_PACKET_ADMIN_POLL:
            console.log(data, "ADMIN_POLL");
            break;
        case PacketType.ADMIN_PACKET_ADMIN_CHAT:
            console.log(data, "ADMIN_CHAT");
            break;
        case PacketType.ADMIN_PACKET_ADMIN_RCON:
            console.log(data, "ADMIN_RCON");
            break;
        case PacketType.ADMIN_PACKET_ADMIN_GAMESCRIPT:
            console.log(data, "ADMIN_GAMESCRIPT");
            break;
        case PacketType.ADMIN_PACKET_ADMIN_PING:
            console.log(data, "ADMIN_PING");
            break;
        case PacketType.ADMIN_PACKET_ADMIN_EXTERNAL_CHAT:
            console.log(data, "ADMIN_EXTERNAL_CHAT");
            break;
        //----------------------------------------
        //          ABOVE IS WHAT WE CAN SEND
        //          BELOW  WE RECEIVE
        //----------------------------------------
        case PacketType.ADMIN_PACKET_SERVER_FULL:
            console.log(Packets.SERVER_FULL(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_BANNED:
            console.log(Packets.SERVER_BANNED(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_ERROR:
            console.log(Packets.SERVER_ERROR(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_PROTOCOL:
            console.log(Packets.SERVER_PROTOCOL(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_WELCOME:
            console.log(Packets.SERVER_WELCOME(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_NEWGAME:
            console.log(Packets.SERVER_NEWGAME(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_SHUTDOWN:
            console.log(Packets.SERVER_SHUTDOWN(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_DATE:
            console.log(Packets.SERVER_DATE(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_CLIENT_JOIN:
            console.log(Packets.SERVER_CLIENT_JOIN(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_CLIENT_INFO:
            console.log(Packets.SERVER_CLIENT_INFO(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_CLIENT_UPDATE:
            console.log(Packets.SERVER_CLIENT_UPDATE(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_CLIENT_QUIT:
            console.log(Packets.SERVER_CLIENT_QUIT(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_CLIENT_ERROR:
            console.log(Packets.SERVER_CLIENT_ERROR(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_COMPANY_NEW:
            console.log(Packets.SERVER_COMPANY_NEW(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_COMPANY_INFO:
            console.log(Packets.SERVER_COMPANY_INFO(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_COMPANY_UPDATE:
            console.log(Packets.SERVER_COMPANY_UPDATE(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_COMPANY_REMOVE:
            console.log(Packets.SERVER_COMPANY_REMOVE(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_COMPANY_ECONOMY:
            console.log(Packets.SERVER_COMPANY_ECONOMY(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_COMPANY_STATS:
            console.log(Packets.SERVER_COMPANY_STATS(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_CHAT:
            console.log(Packets.SERVER_CHAT(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_RCON:
            console.log(Packets.SERVER_RCON(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_CONSOLE:
            console.log(Packets.SERVER_CONSOLE(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_CMD_NAMES:
            console.log(Packets.SERVER_CMD_NAMES(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_CMD_LOGGING_OLD:
            console.log(Packets.SERVER_CMD_LOGGING_OLD(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_GAMESCRIPT:
            console.log(Packets.SERVER_GAMESCRIPT(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_RCON_END:
            console.log(Packets.SERVER_RCON_END(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_PONG:
            console.log(Packets.SERVER_PONG(data));
            break;
        case PacketType.ADMIN_PACKET_SERVER_CMD_LOGGING:
            console.log(Packets.SERVER_CMD_LOGGING(data));
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
    //Above lets us connect the bot to the server. Once connected
    //we need to send it config so that it can update us on events
    //for example
    //DATE | WEEKLY
    //CLIENT INFO | AUTOMATIC
    //COMPANY INFO | AUTOMATIC
    //COMPANY ECONOMY | QUARTERLY
    //COMPANY STATS | YEARLY
    //
    //The above will provide us with all the game data we will need
    socket.write(Buffer.from([0x07, 0x00, 0x02, AdminUpdateType.Date, 0x00, AdminUpdateFrequency.Weekly, 0x00])); //DATE             | WEEKLY
    socket.write(Buffer.from([0x07, 0x00, 0x02, AdminUpdateType.ClientInfo, 0x00, AdminUpdateFrequency.Automatic, 0x00])); //CLIENT INFO      | AUTOMATIC
    socket.write(Buffer.from([0x07, 0x00, 0x02, AdminUpdateType.CompanyInfo, 0x00, AdminUpdateFrequency.Automatic, 0x00])); //COMPANY INFO     | AUTOMATIC
    socket.write(Buffer.from([0x07, 0x00, 0x02, AdminUpdateType.CompanyEcon, 0x00, AdminUpdateFrequency.Quarterly, 0x00])); //COMPANY ECONOMY  | QUARTERLY
    socket.write(Buffer.from([0x07, 0x00, 0x02, AdminUpdateType.CompanyStats, 0x00, AdminUpdateFrequency.Anually, 0x00])); //COMPANY STATS    | ANNUALY
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
app.get("/server", function (req, res) {
    res.json(ServerData);
});
app.get("/update/:type/:freq", function (req, res) {
    //Packet Format is SIZE SIZE TYPE DATA 
    //ADMIN_PACKET_UPDATE_FREQUENCY = 0x02
    //Frequenices are
    // 0,Automatic,Anually,Quarterly Monthly,Weekly,Daily,Poll
    var temp = Buffer.from([0x07, 0x00, 0x02, AdminUpdateType[req.params["type"]], 0x00, AdminUpdateFrequency[req.params["freq"]], 0x00]);
    socket.write(temp);
    console.log("writing to Server", temp);
    res.json({
        Freqs: AdminUpdateType,
        Types: AdminUpdateFrequency
    });
});
app.listen("3000", function () {
    console.log("Server listening on 3000");
});
