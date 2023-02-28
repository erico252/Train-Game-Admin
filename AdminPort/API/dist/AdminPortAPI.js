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
exports.createConnection = exports.createUpdatePacket = exports.createPollPacket = exports.RawReceivedPacket = void 0;
//--IMPORTS--
var net = require("net");
var Packets = require("../dist/PacketFunctions");
var Constants_1 = require("../dist/Constants");
var http = require('http');
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
function createPollPacket(UpdateType, CompanyID) {
    var Packet = Buffer.alloc(8);
    Packet.writeUIntBE(0x0800, 0, 2);
    Packet.writeUIntBE(0x03, 2, 1);
    Packet.writeUIntBE(UpdateType, 3, 1);
    Packet.writeUIntBE(CompanyID, 4, 4);
    console.log(Packet, "POLL PACKET");
    return (Packet);
}
exports.createPollPacket = createPollPacket;
function createUpdatePacket(UpdateType, UpdateFrequency) {
    var Packet;
    //certain updates can only have certain values
    //do we want to return failures if you choose an invalid value?
    Packet = Buffer.from([0x07, 0x00, 0x02, UpdateType, 0x00, UpdateFrequency, 0x00]);
    console.log(Packet, "UPDATE PACKET");
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
    //Array Retunred by Various Functions
    var response;
    //When we Create a Company, we will out a New Company Object
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
        ID: 0,
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
    //When we Poll for Companies, we change an Existing Companies data
    var ExistingCompany;
    //When we Create a Client, we will out a New Client Object
    var NewClient = {
        ID: 0,
        ClientName: null,
        ClientCompanyID: null
    };
    //When we Poll for Clients, we change an Existing Clients data
    var ExistingClient;
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
            response = Packets.SERVER_FULL(data);
            console.log("SERVER Full");
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_BANNED:
            response = Packets.SERVER_BANNED(data);
            console.log("SERVER Banned");
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_ERROR:
            response = Packets.SERVER_ERROR(data);
            console.log("SERVER Error");
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_PROTOCOL:
            response = Packets.SERVER_PROTOCOL(data);
            console.log("SERVER Protocol");
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_WELCOME:
            response = Packets.SERVER_WELCOME(data);
            console.log("SERVER Welcome");
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
            console.log("SERVER New Game");
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_SHUTDOWN:
            response = Packets.SERVER_SHUTDOWN(data);
            console.log("SERVER Shutdown");
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_DATE:
            response = Packets.SERVER_DATE(data);
            console.log("SERVER Date");
            ServerObj.CurrentDate = response[0];
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_CLIENT_JOIN:
            response = Packets.SERVER_CLIENT_JOIN(data);
            console.log(response, "CLIENT Join");
            NewClient.ID = response[0];
            //ServerObj.Clients.push(NewClient)
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_CLIENT_INFO:
            response = Packets.SERVER_CLIENT_INFO(data);
            console.log("CLIENT Info");
            var ClientID_1 = response[0];
            var NetworkAddress = response[1];
            var Name = response[2];
            if (ClientID_1 == 1) {
                Name = "Admin";
            }
            var Language = response[3];
            var JoinDate = response[4];
            var CompanyID = response[5];
            ExistingClient = ServerObj.Clients.find(function (obj) {
                return obj.ID == ClientID_1;
            });
            if (ExistingClient == undefined) {
                console.log(ClientID_1, "Is New!");
                NewClient = {
                    ID: ClientID_1,
                    ClientName: Name,
                    ClientCompanyID: CompanyID
                };
                ServerObj.Clients.push(NewClient);
            }
            else {
                console.log(ClientID_1, "Exists!");
            }
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_CLIENT_UPDATE:
            response = Packets.SERVER_CLIENT_UPDATE(data);
            console.log("CLIENT Update");
            ExistingClient = ServerObj.Clients.find(function (obj) {
                return obj.ID == response[0];
            });
            if (ExistingClient == undefined) {
                console.log(response[0], "Does Not Exist");
            }
            else {
                console.log(response[0], "Updated!");
                ExistingClient.ID = response[0];
                ExistingClient.Name = response[1];
                ExistingClient.CompanyID = response[2];
            }
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_CLIENT_QUIT:
            response = Packets.SERVER_CLIENT_QUIT(data);
            console.log("CLIENT Quit");
            var ClientRemoveIndex = ServerObj.Clients.findIndex(function (obj) {
                return obj.ID == response[0];
            });
            if (ClientRemoveIndex < 0) {
                console.log(response[0], "Does Not Exist");
            }
            else {
                console.log(response[0], "Quit!");
                ServerObj.Clients.splice(ClientRemoveIndex, 1);
            }
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_CLIENT_ERROR:
            response = Packets.SERVER_CLIENT_ERROR(data);
            console.log("CLIENT Error");
            console.log("Client ID:", response[0]);
            console.log("Error Code:", response[1]);
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_COMPANY_NEW:
            response = Packets.SERVER_COMPANY_NEW(data);
            console.log(response, "New Company Created!");
            NewCompany.ID = response[0];
            //ServerObj.Companies.push(NewCompany)
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_COMPANY_INFO:
            response = Packets.SERVER_COMPANY_INFO(data);
            console.log("COMPANY Info");
            ExistingCompany = ServerObj.Companies.find(function (obj) {
                return obj.ID == response[0];
            });
            if (ExistingCompany == undefined) {
                console.log(response[0], "Is New!");
                NewCompany.ID = response[0];
                NewCompany.CompanyName = response[1];
                NewCompany.ManagerName = response[2];
                NewCompany.Color = response[3];
                NewCompany.PasswordFlag = response[4];
                NewCompany.AIFlag = response[6];
                ServerObj.Companies.push(NewCompany);
            }
            else {
                console.log(response[0], "Exists!");
                console.log("Pre", ExistingCompany);
                ExistingCompany.CompanyName = response[1];
                ExistingCompany.ManagerName = response[2];
                ExistingCompany.Color = response[3];
                ExistingCompany.PasswordFlag = response[4];
                ExistingCompany.AIFlag = response[6];
                console.log("Post", ExistingCompany);
            }
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_COMPANY_UPDATE:
            response = Packets.SERVER_COMPANY_UPDATE(data);
            console.log("COMPANY Update");
            var UpdateCompanyID_1 = response[0];
            ExistingCompany = ServerObj.Companies.find(function (obj) {
                return obj.ID == UpdateCompanyID_1;
            });
            if (ExistingCompany != undefined) {
                console.log("Pre", ExistingCompany);
                ExistingCompany.CompanyName = response[1],
                    ExistingCompany.ManagerName = response[2],
                    ExistingCompany.Color = response[3],
                    ExistingCompany.PasswordFlag = response[4],
                    ExistingCompany.Share1 = response[5],
                    ExistingCompany.Share2 = response[6],
                    ExistingCompany.Share3 = response[7],
                    ExistingCompany.Share4 = response[8];
                console.log("Post", ExistingCompany);
            }
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_COMPANY_REMOVE:
            response = Packets.SERVER_COMPANY_REMOVE(data);
            console.log("COMPANY Remove");
            var CompanyRemoveIndex = ServerObj.Companies.findIndex(function (obj) {
                return obj.ID == response[0];
            });
            if (CompanyRemoveIndex < 0) {
                console.log(response[0], "Does Not Exist");
            }
            else {
                console.log(response[0], "Is Removed!");
                ServerObj.Companies.splice(CompanyRemoveIndex, 1);
            }
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_COMPANY_ECONOMY:
            response = Packets.SERVER_COMPANY_ECONOMY(data);
            console.log("COMPANY Economy");
            //Note some Economy values are BigInt, they are converted via Number()
            ExistingCompany = ServerObj.Companies.find(function (obj) {
                return obj.ID == response[0];
            });
            if (ExistingCompany != undefined) {
                ExistingCompany.Economy.Money = Number(response[1]);
                ExistingCompany.Economy.Loan = Number(response[2]);
                ExistingCompany.Economy.Income = Number(response[3]);
                ExistingCompany.Economy.ThisDeliveredCargo = response[4];
                ExistingCompany.Economy.LastCompanyValue = Number(response[5]);
                ExistingCompany.Economy.LastPerformance = response[6];
                ExistingCompany.Economy.LastDeliveredCargo = response[7];
                ExistingCompany.Economy.PrevCompanyValue = Number(response[8]);
                ExistingCompany.Economy.PrevPerformance = response[9];
                ExistingCompany.Economy.PrevDeliveredCargo = response[10];
            }
            else {
                console.log("ERROR finding Company");
            }
            break;
        case Constants_1.PacketType.ADMIN_PACKET_SERVER_COMPANY_STATS:
            response = Packets.SERVER_COMPANY_STATS(data);
            console.log("COMPANY Stats");
            ExistingCompany = ServerObj.Companies.find(function (obj) {
                return obj.ID == response[0];
            });
            if (ExistingCompany != undefined) {
                ExistingCompany.Stats.Trains = response[1];
                ExistingCompany.Stats.Lorries = response[2];
                ExistingCompany.Stats.Busses = response[3];
                ExistingCompany.Stats.Planes = response[4];
                ExistingCompany.Stats.Ships = response[5];
                ExistingCompany.Stats.TrainStations = response[6];
                ExistingCompany.Stats.LorryStations = response[7];
                ExistingCompany.Stats.BusStops = response[8];
                ExistingCompany.Stats.AirPorts = response[9];
                ExistingCompany.Stats.Harbours = response[10];
            }
            else {
                console.log("ERROR finding Company");
            }
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
        console.log(err.message, "We should Ping the Disconnect/Error EndPoint when we error");
        http.get("http://localhost:3000/socket/".concat(UUID, "/error"));
        return ([null, null]);
    });
    // Add a 'close' event handler for the client socket
    socket.on('close', function () {
        console.log("Connection Closed");
    });
    return ([socket, ServerObj]);
}
exports.createConnection = createConnection;
