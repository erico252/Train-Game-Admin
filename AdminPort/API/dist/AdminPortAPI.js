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
exports.createConnection = exports.createUpdatePacket = exports.RawReceivedPacket = void 0;
//--IMPORTS--
var net = require("net");
var Packets = require("../dist/PacketFunctions");
var Constants_1 = require("../dist/Constants");
var http = require('node:http');
//--GLOBALS--
var ServerObjProtoType = {
    UUID: null,
    Companies: [],
    Clients: [],
    CurrentDate: 0,
    ServerName: "",
    MapSeed: 0,
    Landscape: 0,
    MapHeight: 0,
    MapWidth: 0,
    StartDate: 0,
    ServerVersion: "",
    DedicatedFlag: false,
    MapName: ""
};
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
function createUpdatePacket(UpdateType, UpdateFrequency) {
    var Packet;
    //certain updates can only have certain values
    //do we want to return failures if you choose an invalid value?
    Packet = Buffer.from([0x07, 0x00, 0x02, Constants_1.AdminUpdateType.Date, 0x00, Constants_1.AdminUpdateFrequency.Weekly, 0x00]);
    return (Packet);
}
exports.createUpdatePacket = createUpdatePacket;
function processPacket(RawPacket, Obj) {
    var rawLength = RawPacket.length;
    var cumulativeLength = 0;
    var ActiveType;
    var ActivePacket;
    while (cumulativeLength < rawLength) {
        //find the type of the packet, type is awlasy the 3rd value
        ActiveType = RawPacket[cumulativeLength + 2];
        //Now that we have the type we can begin to take infomation out of the packets
        ActivePacket = RawPacket.subarray(cumulativeLength, cumulativeLength + RawPacket[cumulativeLength]);
        processType(ActiveType, ActivePacket.subarray(3, ActivePacket.length), Obj);
        cumulativeLength = cumulativeLength + RawPacket[cumulativeLength];
    }
}
function processType(Type, data, ServerObj) {
    //Likely we will just need a large switch case to  deal with all of the diffrent Packets
    //This is probably easiest to do by abstractig it away in a seperate file but we will 
    //Attempt on small scale here
    var i = 0;
    var response;
    switch (Type) {
        case Constants_1.PacketType.ADMIN_PACKET_ADMIN_JOIN:
            console.log(data, "ADMIN_JOIN");
            break;
        case Constants_1.PacketType.ADMIN_PACKET_ADMIN_QUIT:
            console.log(data, "ADMIN_QUIT");
            break;
        case Constants_1.PacketType.ADMIN_PACKET_ADMIN_UPDATE_FREQUENCY:
            console.log(data, "ADMIN_UPDATE_FREQUENCY");
            break;
        case Constants_1.PacketType.ADMIN_PACKET_ADMIN_POLL:
            console.log(data, "ADMIN_POLL");
            break;
        case Constants_1.PacketType.ADMIN_PACKET_ADMIN_CHAT:
            console.log(data, "ADMIN_CHAT");
            break;
        case Constants_1.PacketType.ADMIN_PACKET_ADMIN_RCON:
            console.log(data, "ADMIN_RCON");
            break;
        case Constants_1.PacketType.ADMIN_PACKET_ADMIN_GAMESCRIPT:
            console.log(data, "ADMIN_GAMESCRIPT");
            break;
        case Constants_1.PacketType.ADMIN_PACKET_ADMIN_PING:
            console.log(data, "ADMIN_PING");
            break;
        case Constants_1.PacketType.ADMIN_PACKET_ADMIN_EXTERNAL_CHAT:
            console.log(data, "ADMIN_EXTERNAL_CHAT");
            break;
        //----------------------------------------
        //          ABOVE IS WHAT WE CAN SEND
        //          BELOW  WE RECEIVE
        //----------------------------------------
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_FULL:
            console.log(Packets.SERVER_FULL(data));
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_BANNED:
            console.log(Packets.SERVER_BANNED(data));
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_ERROR:
            console.log(Packets.SERVER_ERROR(data));
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_PROTOCOL:
            response = Packets.SERVER_PROTOCOL(data);
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_WELCOME:
            response = Packets.SERVER_WELCOME(data);
            ServerObj.ServerName = response[0];
            ServerObj.ServerVersion = response[1];
            ServerObj.DedicatedFlag = response[2];
            ServerObj.MapName = response[3];
            ServerObj.MapSeed = response[4];
            ServerObj.Landscape = response[5].value;
            ServerObj.StartDate = response[6];
            ServerObj.MapWidth = response[7];
            ServerObj.MapHeight = response[8];
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_NEWGAME:
            response = Packets.SERVER_NEWGAME(data);
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_SHUTDOWN:
            console.log(Packets.SERVER_SHUTDOWN(data));
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_DATE:
            response = Packets.SERVER_DATE(data);
            ServerObj.CurrentDate = response[0];
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_CLIENT_JOIN:
            response = Packets.SERVER_CLIENT_JOIN(data);
            var NewClient = {
                ID: response[0],
                ClientName: null,
                ClientCompanyID: null
            };
            ServerObj.Clients.push(NewClient);
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_CLIENT_INFO:
            response = Packets.SERVER_CLIENT_INFO(data);
            console.log("What is triggering this?");
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_CLIENT_UPDATE:
            response = Packets.SERVER_CLIENT_UPDATE(data);
            var UpdateClientID_1 = response[0];
            ServerObj.Clients.forEach(function (Client) {
                if (Client.ID == UpdateClientID_1) {
                    Client.ClientName = response[1];
                    Client.ClientCompanyID = response[2];
                }
            });
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_CLIENT_QUIT:
            response = Packets.SERVER_CLIENT_QUIT(data);
            var RemovalClientID_1 = response[0];
            i = 0;
            ServerObj.Clients.forEach(function (Client, index) {
                if (RemovalClientID_1 == Client.ID) {
                    i = index;
                }
            });
            ServerObj.Clients.splice(i);
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_CLIENT_ERROR:
            console.log(Packets.SERVER_CLIENT_ERROR(data));
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_COMPANY_NEW:
            response = Packets.SERVER_COMPANY_NEW(data);
            var NewCompanyEconomy = {
                Money: 0,
                Loan: 0,
                Income: 0,
                ThisDeliveredCargo: 0,
                LastCompanyValue: 0,
                LastPerformance: 0,
                LastDeliveredCargo: 0,
                PrevCompanyValue: 0,
                PrevPerformance: 0,
                PrevDeliveredCargo: 0
            };
            var NewCompanyStats = {
                Trains: 0,
                Lorries: 0,
                Busses: 0,
                Planes: 0,
                Ships: 0,
                TrainStations: 0,
                LorryStations: 0,
                BusStops: 0,
                AirPorts: 0,
                Harbours: 0
            };
            var NewCompany = {
                ID: response[0],
                CompanyName: null,
                ManagerName: null,
                Color: null,
                PasswordFlag: null,
                Share1: null,
                Share2: null,
                Share3: null,
                Share4: null,
                Economy: NewCompanyEconomy,
                Stats: NewCompanyStats
            };
            ServerObj.Companies.push(NewCompany);
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_COMPANY_INFO:
            console.log(Packets.SERVER_COMPANY_INFO(data));
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_COMPANY_UPDATE:
            response = Packets.SERVER_COMPANY_UPDATE(data);
            var UpdateCompanyID_1 = response[0];
            ServerObj.Companies.forEach(function (Company) {
                if (UpdateCompanyID_1 == Company.ID) {
                    Company.CompanyName = response[1],
                        Company.ManagerName = response[2],
                        Company.Color = response[3],
                        Company.PasswordFlag = response[4],
                        Company.Share1 = response[5],
                        Company.Share2 = response[6],
                        Company.Share3 = response[7],
                        Company.Share4 = response[8];
                }
            });
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_COMPANY_REMOVE:
            response = Packets.SERVER_COMPANY_REMOVE(data);
            var RemovalCompanyID_1 = response[0];
            i = 0;
            ServerObj.Companies.forEach(function (Company, index) {
                if (RemovalCompanyID_1 == Company.ID) {
                    i = index;
                }
            });
            ServerObj.Companies.splice(i);
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_COMPANY_ECONOMY:
            response = Packets.SERVER_COMPANY_ECONOMY(data);
            var EconomyCompanyID_1 = response[0];
            ServerObj.Companies.forEach(function (Company) {
                if (EconomyCompanyID_1 == Company.ID) {
                    Company.Economy.Money = response[1];
                    Company.Economy.Loan = response[2];
                    Company.Economy.Income = response[3];
                    Company.Economy.ThisDeliveredCargo = response[4];
                    Company.Economy.LastCompanyValue = response[5];
                    Company.Economy.LastPerformance = response[6];
                    Company.Economy.LastDeliveredCargo = response[7];
                    Company.Economy.PrevCompanyValue = response[8];
                    Company.Economy.PrevPerformance = response[9];
                    Company.Economy.PrevDeliveredCargo = response[10];
                }
            });
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_COMPANY_STATS:
            response = Packets.SERVER_COMPANY_STATS(data);
            var StatsCompanyID_1 = response[0];
            ServerObj.Companies.forEach(function (Company) {
                if (StatsCompanyID_1 == Company.ID) {
                    Company.Stats.Trains = response[1];
                    Company.Stats.Lorries = response[2];
                    Company.Stats.Busses = response[3];
                    Company.Stats.Planes = response[4];
                    Company.Stats.Ships = response[5];
                    Company.Stats.TrainStations = response[6];
                    Company.Stats.LorryStations = response[7];
                    Company.Stats.BusStops = response[8];
                    Company.Stats.AirPorts = response[9];
                    Company.Stats.Harbours = response[10];
                }
            });
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_CHAT:
            console.log(Packets.SERVER_CHAT(data));
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_RCON:
            console.log(Packets.SERVER_RCON(data));
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_CONSOLE:
            console.log(Packets.SERVER_CONSOLE(data));
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_CMD_NAMES:
            console.log(Packets.SERVER_CMD_NAMES(data));
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_CMD_LOGGING_OLD:
            console.log(Packets.SERVER_CMD_LOGGING_OLD(data));
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_GAMESCRIPT:
            console.log(Packets.SERVER_GAMESCRIPT(data));
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_RCON_END:
            console.log(Packets.SERVER_RCON_END(data));
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_PONG:
            console.log(Packets.SERVER_PONG(data));
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_CMD_LOGGING:
            console.log(Packets.SERVER_CMD_LOGGING(data));
        default:
            console.log("The Packet TYpe ".concat(Type, " is not yet accounted for"));
    }
}
//--MAIN--
//Create a socket to be used for connection
function createConnection(UUID, HOST, PORT, PASS, NAME, VERISON) {
    var ServerObj = Object.assign({}, ServerObjProtoType);
    ServerObj.UUID = UUID;
    var socket = new net.Socket();
    //Connect to the open and active OpenTTD Server
    socket.connect(PORT, HOST, function () {
        console.log('CONNECTED TO: ' + HOST + ':' + PORT);
        socket.write(createAdminJoin(PASS, NAME, VERISON));
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
        socket.write(Buffer.from([0x07, 0x00, 0x02, Constants_1.AdminUpdateType.Date, 0x00, Constants_1.AdminUpdateFrequency.Weekly, 0x00])); //DATE             | WEEKLY
        socket.write(Buffer.from([0x07, 0x00, 0x02, Constants_1.AdminUpdateType.ClientInfo, 0x00, Constants_1.AdminUpdateFrequency.Automatic, 0x00])); //CLIENT INFO      | AUTOMATIC
        socket.write(Buffer.from([0x07, 0x00, 0x02, Constants_1.AdminUpdateType.CompanyInfo, 0x00, Constants_1.AdminUpdateFrequency.Automatic, 0x00])); //COMPANY INFO     | AUTOMATIC
        socket.write(Buffer.from([0x07, 0x00, 0x02, Constants_1.AdminUpdateType.CompanyEcon, 0x00, Constants_1.AdminUpdateFrequency.Quarterly, 0x00])); //COMPANY ECONOMY  | QUARTERLY
        socket.write(Buffer.from([0x07, 0x00, 0x02, Constants_1.AdminUpdateType.CompanyStats, 0x00, Constants_1.AdminUpdateFrequency.Anually, 0x00])); //COMPANY STATS    | ANNUALY
    });
    socket.on('data', function (data) {
        //everytime the socket receives data, this event is triggered
        //Everytime Event is triggered we need to process the data
        //Mulitple Packets coould arrive in single event
        //For this reason we will need to use the SIZE to seperate Packets
        processPacket(data, ServerObj);
    });
    socket.on('error', function (err) {
        console.log(err.message);
        return ([null, null]);
    });
    // Add a 'close' event handler for the client socket
    socket.on('close', function () {
        socket.write;
        //When the socket closes, send a request to remove it form list
        var postData = JSON.stringify({
            ID: UUID
        });
        var options = {
            hostname: '127.0.0.1',
            port: 3000,
            path: '/close',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        console.log('Connection closed');
        var req = http.request(options, function (res) {
            console.log("Closeing Conection, Removing From List");
        });
        req.on('error', function (e) {
            console.error("problem with request: ".concat(e.message));
        });
        // Write data to request body
        req.write(postData);
        req.end();
    });
    return ([socket, ServerObj]);
}
exports.createConnection = createConnection;
