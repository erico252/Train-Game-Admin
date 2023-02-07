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

import { Server } from "net";
import { EmptyStatement } from "typescript";

//--IMPORTS--
var net = require('net');
const express = require("express");
const app = express();



//--GLOBALS--
const PacketType = {
    ADMIN_PACKET_ADMIN_JOIN:0,             
    ADMIN_PACKET_ADMIN_QUIT:1,             
    ADMIN_PACKET_ADMIN_UPDATE_FREQUENCY:2, 
    ADMIN_PACKET_ADMIN_POLL:3,             
    ADMIN_PACKET_ADMIN_CHAT:4,             
    ADMIN_PACKET_ADMIN_RCON:5,             
    ADMIN_PACKET_ADMIN_GAMESCRIPT:6,       
    ADMIN_PACKET_ADMIN_PING:7,             
    ADMIN_PACKET_ADMIN_EXTERNAL_CHAT:8,    
    
    ADMIN_PACKET_SERVER_FULL:100,      
    ADMIN_PACKET_SERVER_BANNED:101,          
    ADMIN_PACKET_SERVER_ERROR:102,           
    ADMIN_PACKET_SERVER_PROTOCOL:103,        
    ADMIN_PACKET_SERVER_WELCOME:104,         
    ADMIN_PACKET_SERVER_NEWGAME:105,         
    ADMIN_PACKET_SERVER_SHUTDOWN:106,        
    
    ADMIN_PACKET_SERVER_DATE:107,            
    ADMIN_PACKET_SERVER_CLIENT_JOIN:108,     
    ADMIN_PACKET_SERVER_CLIENT_INFO:109,     
    ADMIN_PACKET_SERVER_CLIENT_UPDATE:110,   
    ADMIN_PACKET_SERVER_CLIENT_QUIT:111,     
    ADMIN_PACKET_SERVER_CLIENT_ERROR:112,    
    ADMIN_PACKET_SERVER_COMPANY_NEW:113,     
    ADMIN_PACKET_SERVER_COMPANY_INFO:114,    
    ADMIN_PACKET_SERVER_COMPANY_UPDATE:115,  
    ADMIN_PACKET_SERVER_COMPANY_REMOVE:116,  
    ADMIN_PACKET_SERVER_COMPANY_ECONOMY:117, 
    ADMIN_PACKET_SERVER_COMPANY_STATS:118,   
    ADMIN_PACKET_SERVER_CHAT:119,            
    ADMIN_PACKET_SERVER_RCON:120,            
    ADMIN_PACKET_SERVER_CONSOLE:121,         
    ADMIN_PACKET_SERVER_CMD_NAMES:122,       
    ADMIN_PACKET_SERVER_CMD_LOGGING_OLD:123, 
    ADMIN_PACKET_SERVER_GAMESCRIPT:124,      
    ADMIN_PACKET_SERVER_RCON_END:125,        
    ADMIN_PACKET_SERVER_PONG:126,            
    ADMIN_PACKET_SERVER_CMD_LOGGING:127,     
    
    INVALID_ADMIN_PACKET: 255,         
}

const HOST:string = '127.0.0.1';
const PORT:number = 3977;
let ServerData:ServerDataObject = {
    Companies: [],
    Clients: [],
    CurrentDate: 0,
    ServerName: "",
    MapSeed: 0,
    MapLand: 0,
    MapHeight: 0,
    MapWidth: 0,
    StartDate: 0,
    ServerVersion:"",
    DedicatedFlag: false,
    MapName:""
}
let RawReceivedPacket:Buffer


//--INTERFACES--
interface ServerDataObject {
    Companies:Array<CompanyObject>
    Clients:Array<ClientObject>
    CurrentDate:number
    ServerName:string
    ServerVersion:string
    DedicatedFlag:boolean
    MapName:string
    MapSeed:number
    MapLand:number
    MapHeight:number
    MapWidth:number
    StartDate:number
    
}
interface CompanyObject {
    ID:number
    Name:string
    ManagerName:string
    Color:number
    PasswordFlag:boolean
    StartYear:number
    AIFlag:boolean
    Economy:CompanyEconomyObject
    Stats:CompanyStatsObject

}
interface ClientObject {
    ID:number
    Network:string
    Name:string
    Language:number
    JoinDate:number
    CompanyID:number
}
interface CompanyEconomyObject {
    Money:number
    Loan:number
    Income:number
    ThisDeliveredCargo:number
    LastCompanyValue:number
    LastPerformance:number
    LastDeliveredCargo:number
    PrevCompanyValue:number
    PrevPerformance:number
    PrevDeliveredCargo:number

}
interface CompanyStatsObject {
    Trains:number
    Lorries:number
    Busses:number
    Planes:number
    Ships:number
    TrainStations:number
    LorryStations:number
    BusStops:number
    AirPorts:number
    Harbours:number
}
//--FUNCTIONS--
function createAdminJoin(Password:string, BotName:string, Version:string) {
    //SIZE  SIZE 0x00 BotName 0x00 Password 0x00  Version 0x00
    let Variables:Array<string> = [Password, BotName, Version]
    let Packet:Buffer = Buffer.from(new Uint8Array([0x00, 0x00, 0x00]))
    Variables.forEach((str:string) => {
        Packet = Buffer.concat([Packet, Buffer.from(str), new Uint8Array([0x00])])
    })
    Packet[0] = Packet.length
    return Packet
}

function processPacket(RawPacket:Buffer){
    let rawLength:number = RawPacket.length
    let cumulativeLength:number = 0
    let ActiveType:number
    let ActivePacket:Buffer
    console.log("RawData:", RawPacket)
    while(cumulativeLength < rawLength){
        //find the type of the packet, type is awlasy the 3rd value
        ActiveType = RawPacket[cumulativeLength+2]
        //Now that we have the type we can begin to take infomation out of the packets
        ActivePacket = RawPacket.subarray(cumulativeLength,cumulativeLength+RawPacket[cumulativeLength])
        processType(ActiveType,ActivePacket.subarray(3,ActivePacket.length))
        cumulativeLength = cumulativeLength + RawPacket[cumulativeLength]
    }

}
function processType(Type:number,data:Buffer){
    //Likely we will just need a large switch case to  deal with all of the diffrent Packets
    //This is probably easiest to do by abstractig it away in a seperate file but we will 
    //Attempt on small scale here
    let i:number = 0
    let j:number = 0
    let nextData:Buffer = data
    let currentData:Buffer
    switch (Type) {
        case PacketType.ADMIN_PACKET_ADMIN_JOIN:
            console.log(data,"ADMIN_JOIN")
            break
        case PacketType.ADMIN_PACKET_ADMIN_QUIT:
            console.log(data,"ADMIN_QUIT")
            break
        case PacketType.ADMIN_PACKET_ADMIN_UPDATE_FREQUENCY:
            console.log(data,"ADMIN_UPDATE_FREQUENCY")
            break
        case PacketType.ADMIN_PACKET_ADMIN_POLL:
            console.log(data,"ADMIN_POLL")
            break
        case PacketType.ADMIN_PACKET_ADMIN_CHAT:
            console.log(data,"ADMIN_CHAT")
            break
        case PacketType.ADMIN_PACKET_ADMIN_RCON:
            console.log(data,"ADMIN_RCON")
            break
        case PacketType.ADMIN_PACKET_ADMIN_GAMESCRIPT:
            console.log(data,"ADMIN_GAMESCRIPT")
            break
        case PacketType.ADMIN_PACKET_ADMIN_PING:
            console.log(data,"ADMIN_PING")
            break
        case PacketType.ADMIN_PACKET_ADMIN_EXTERNAL_CHAT:
            console.log(data,"ADMIN_EXTERNAL_CHAT")
            break
        
        case PacketType.ADMIN_PACKET_SERVER_FULL:
            console.log(data,"SERVER_FULL")
            break
        case PacketType.ADMIN_PACKET_SERVER_BANNED:
            console.log(data,"SERVER_BANNED")
            break
        case PacketType.ADMIN_PACKET_SERVER_ERROR:
            console.log(data,"SERVER_ERROR")
            break
        case PacketType.ADMIN_PACKET_SERVER_PROTOCOL:
            console.log(data.toString(),"SERVER_PROTOCOL");
            break
        case PacketType.ADMIN_PACKET_SERVER_WELCOME:
        
        //Extract the NameServer STRING     Random Len, end on 0x00
            //Find where string ends
            currentData = nextData.subarray(0,nextData.indexOf(0x00))
            nextData = nextData.subarray(nextData.indexOf(0x00)+1)
            console.log(nextData)
            
            ServerData.ServerName = currentData.toString()
            console.log(ServerData.ServerName)
        //Extract the Version STRING        Random Len, end on 0x00
            currentData = nextData.subarray(0,nextData.indexOf(0x00))
            nextData = nextData.subarray(nextData.indexOf(0x00)+1)

            ServerData.ServerVersion = currentData.toString()
            console.log(ServerData.ServerVersion)  
        //Extract the DedicatedFlag BOOL    Len = 1
            currentData = nextData.subarray(0,1)
            nextData = nextData.subarray(1)

            if(currentData == Buffer.from([0x00])){ServerData.DedicatedFlag = false}
            else{ServerData.DedicatedFlag = true}
            console.log(ServerData.DedicatedFlag,nextData)
        //Extract the NameMap STRING        Random Len, end on 0x00
            currentData = nextData.subarray(0,nextData.indexOf(0x00))
            nextData = nextData.subarray(nextData.indexOf(0x00)+1)

            ServerData.MapName = currentData.toString()
            console.log(ServerData.MapName,nextData)
        //Extract the Seed UINT32           len = 4
            currentData = nextData.subarray(0,4)
            nextData = nextData.subarray(4)

            ServerData.MapSeed = currentData.readUInt32LE(0)
            console.log(ServerData.MapSeed,nextData)
        //Extract the Landscape UINT8       len = 1
            currentData = nextData.subarray(0,1)
            nextData = nextData.subarray(1)

            ServerData.MapLand = currentData.readUInt8(0)
            console.log(ServerData.MapLand,nextData)
        //Extract the StartDate UINT32      len = 4
            currentData = nextData.subarray(0,4)
            nextData = nextData.subarray(4)

            ServerData.StartDate = currentData.readUInt32LE(0)
            console.log(ServerData.StartDate,nextData)
        //Extract the Width UINT16          len = 2
            currentData = nextData.subarray(0,2)
            nextData = nextData.subarray(2)

            ServerData.MapWidth = currentData.readUInt16LE(0)
            console.log(ServerData.MapWidth,nextData)
        //Extract the Height UINT16         len = 2
            ServerData.MapHeight = currentData.readUInt16LE(0)
            console.log(ServerData.MapHeight)
            break
        case PacketType.ADMIN_PACKET_SERVER_NEWGAME:
            console.log(data,"SERVER_NEWGAME")
            break
        case PacketType.ADMIN_PACKET_SERVER_SHUTDOWN:
            console.log(data,"SERVER_SHUTDOWN")
            break
        case PacketType.ADMIN_PACKET_SERVER_DATE:
            ServerData.CurrentDate = data.readUInt32LE(0)-ServerData.StartDate
            console.log(ServerData.CurrentDate,"SERVER_DATE")
            break
        case PacketType.ADMIN_PACKET_SERVER_CLIENT_JOIN:

            console.log(data,"SERVER_CLIENT_JOIN")
            break
        case PacketType.ADMIN_PACKET_SERVER_CLIENT_INFO:
            let NewClient:ClientObject = {
                ID:0,
                Network:"",
                Name:"",
                Language:0,
                JoinDate:0,
                CompanyID:0
            }          
        //Extract ID UINT32
            currentData = nextData.subarray(0,4)
            nextData = nextData.subarray(4)

            NewClient.ID = currentData.readUInt32LE(0)
            console.log(NewClient.ID,nextData)
        //Extract Network Address STRING
            currentData = nextData.subarray(0,nextData.indexOf(0x00))
            nextData = nextData.subarray(nextData.indexOf(0x00)+1)

            NewClient.Network = currentData.toString()
            console.log(NewClient.Network,nextData)
        //Extract Name STRING
            currentData = nextData.subarray(0,nextData.indexOf(0x00))
            nextData = nextData.subarray(nextData.indexOf(0x00)+1)

            NewClient.Name = currentData.toString()
            console.log(NewClient.Name,nextData)
        //Extract Language UINT8
            currentData = nextData.subarray(0,1)
            nextData = nextData.subarray(1)

            NewClient.Language = currentData.readUInt8(0)
            console.log(NewClient.Language,nextData)
        //Extract Join Date UINT32
            currentData = nextData.subarray(0,4)
            nextData = nextData.subarray(4)

            NewClient.JoinDate = currentData.readUInt32LE(0)
            console.log(NewClient.JoinDate,nextData)
        //Extract Company ID UINT8
            currentData = nextData.subarray(0,1)
            nextData = nextData.subarray(1)

            NewClient.CompanyID = currentData.readUInt8(0)
            console.log(NewClient.CompanyID,nextData)
            console.log(data,"^SERVER_CLIENT_INFO^")
            break
        case PacketType.ADMIN_PACKET_SERVER_CLIENT_UPDATE:
            let a
            //Extract Client ID UINT32
            currentData = nextData.subarray(0,4)
            nextData = nextData.subarray(4)

            a = currentData.readUInt32LE(0)
            console.log(a,nextData)
            //Extract Name STRING
            currentData = nextData.subarray(0,nextData.indexOf(0x00))
            nextData = nextData.subarray(nextData.indexOf(0x00)+1)

            a = currentData.toString()
            console.log(a,nextData)
            //Extract New Company ID UINT8
            currentData = nextData.subarray(0,1)
            nextData = nextData.subarray(1)

            a = currentData.readUInt8(0)
            console.log(a,nextData)
            console.log(data,"SERVER_CLIENT_UPDATE")
            break
        case PacketType.ADMIN_PACKET_SERVER_CLIENT_QUIT:
            console.log(data,"SERVER_CLIENT_QUIT")
            break
        case PacketType.ADMIN_PACKET_SERVER_CLIENT_ERROR:
            console.log(data,"SERVER_CLIENT_ERROR")
            break
        case PacketType.ADMIN_PACKET_SERVER_COMPANY_NEW:
            console.log(data,"SERVER__COMPANY_NEW")
            break
        case PacketType.ADMIN_PACKET_SERVER_COMPANY_INFO:
            console.log(data,"SERVER_COMPANY_INFO")
            break
        case PacketType.ADMIN_PACKET_SERVER_COMPANY_UPDATE:
            console.log(data,"SERVER_COMPANY_UPDATE")
            break
        case PacketType.ADMIN_PACKET_SERVER_COMPANY_UPDATE:
            console.log(data,"SERVER_COMPANY_REMOVE")
            break
        case PacketType.ADMIN_PACKET_SERVER_COMPANY_ECONOMY:
            console.log(data,"SERVER_COMPANY_ECONOMY")
            break
        case PacketType.ADMIN_PACKET_SERVER_COMPANY_STATS:
            console.log(data,"SERVER_COMPANY_STATS")
            break
        case PacketType.ADMIN_PACKET_SERVER_CHAT:
            console.log(data,"SERVER_CHAT")
            break
        case PacketType.ADMIN_PACKET_SERVER_RCON:
            console.log(data,"SERVER_RCON")
            break
        case PacketType.ADMIN_PACKET_SERVER_CONSOLE:
            console.log(data,"SERVER_CONSOLE")
            break
        case PacketType.ADMIN_PACKET_SERVER_CMD_NAMES:
            console.log(data,"SERVER_CMD_NAMES")
            break
        case PacketType.ADMIN_PACKET_SERVER_CMD_LOGGING_OLD:
            console.log(data,"SERVER_CMD_LOGGING_OLD")
            break
        case PacketType.ADMIN_PACKET_SERVER_GAMESCRIPT:
            console.log(data,"SERVER_GAMESCRIPT")
            break
        case PacketType.ADMIN_PACKET_SERVER_RCON_END:
            console.log(data,"SERVER_RCON_END")
            break
        case PacketType.ADMIN_PACKET_SERVER_PONG:
            console.log(data,"SERVER_PONG")
            break
        case PacketType.ADMIN_PACKET_SERVER_CMD_LOGGING:
            console.log(data,"SERVER_CMD_LOGGING")
        default:
          console.log(`The Packet TYpe ${Type} is not yet accounted for`)
      }
}
//--MAIN--
//Create a socket to be used for connection

let socket = new net.Socket();
//Connect to the open and active OpenTTD Server
socket.connect(PORT, HOST, function() {
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    socket.write(createAdminJoin("Eric", "Erics Bot", "1.0"));
});
socket.on('data', function(data) {
    //everytime the socket receives data, this event is triggered
    //Everytime Event is triggered we need to process the data
    //Mulitple Packets coould arrive in single event
    //For this reason we will need to use the SIZE to seperate Packets

    RawReceivedPacket = Buffer.from(data,"hex")
    processPacket(RawReceivedPacket)

});
// Add a 'close' event handler for the client socket
socket.on('close', function() {
    console.log('Connection closed');
});

//--ROUTES--
app.get("/", (req,res) => { // A Splash for API
    res.send("RESTful API for OpenTTD implemented via NodeJS")
    
})

app.get("/server", (req,res) => {
    res.json(
        ServerData
    )
})
app.get("/update/:type/:freq",(req,res) => {
    //Packet Format is SIZE SIZE TYPE DATA 
    //ADMIN_PACKET_UPDATE_FREQUENCY = 0x02
    //Frequenices are
    const AdminUpdateFrequency = {
        Automatic: 0x40,
        Anually: 0x20,
        Quarterly: 0x10,
        Monthly: 0x08,
        Weekly: 0x04,
        Daily: 0x02,
        Poll: 0x01
    }
    const AdminUpdateType = {
        Date:0x00,
        ClientInfo: 0x01,
        CompanyInfo:0x02,
        CompanyEcon:0x03,
        CompanyStats:0x04,
        Chat:0x05,
        Console:0x06,
        CMDNames:0x07,
        CMDLogging:0x08,
        GameScript:0x09,
        End:0x10
    }
    // 0,Automatic,Anually,Quarterly Monthly,Weekly,Daily,Poll
    let temp:Buffer = Buffer.from([0x07,0x00,0x02,AdminUpdateType[req.params["type"]],0x00,AdminUpdateFrequency[req.params["freq"]],0x00])
    socket.write(temp);
    console.log("writing to Server",temp)
    res.json({
        Freqs:AdminUpdateType,
        Types:AdminUpdateFrequency
    })
})







app.listen("3000", () => {
    console.log(`Server listening on 3000`);
  });