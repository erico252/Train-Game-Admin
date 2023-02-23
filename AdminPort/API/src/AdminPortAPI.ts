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

import * as net from "net";
import { EmptyStatement } from "typescript";
import * as Packets from "../dist/PacketFunctions"
import {ServerObject, ClientObject, CompanyObject, CompanyEconomyObject, CompanyStatsObject}  from "../dist/Interfaces"
import {NetworkErrorCode, AdminUpdateFrequency, AdminUpdateType, PacketType, HOST, PORT} from "../dist/Constants"
const http = require('node:http');



//--GLOBALS--
const ServerObjProtoType:ServerObject = {
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
    ServerVersion:"",
    DedicatedFlag: false,
    MapName:""
}
export let RawReceivedPacket:Buffer



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
export function createPollPacket(UpdateType:number,CompanyID:number){
    let Packet:Buffer = Buffer.alloc(8)
    Packet.writeUintBE(0x0800,0,2)
    Packet.writeUintBE(0x03,2,1)
    Packet.writeUintBE(UpdateType,3,1)
    Packet.writeUintBE(CompanyID,4,4)
    console.log(Packet,"POLL PACKET")
    return(Packet)
} 
export function createUpdatePacket(UpdateType:number,UpdateFrequency:number){
    let Packet:Buffer
    //certain updates can only have certain values
    //do we want to return failures if you choose an invalid value?
    Packet = Buffer.from([0x07, 0x00, 0x02, UpdateType, 0x00, UpdateFrequency, 0x00])
    console.log(Packet,"UPDATE PACKET")
    return(Packet)
} 
function processPacket(RawPacket:Buffer, Obj:ServerObject){
    let rawLength:number = RawPacket.length
    let cumulativeLength:number = 0
    let ActiveType:number
    let ActivePacket:Buffer
    while(cumulativeLength < rawLength){
        //find the type of the packet, type is awlasy the 3rd value
        ActiveType = RawPacket[cumulativeLength+2]
        //Now that we have the type we can begin to take infomation out of the packets
        ActivePacket = RawPacket.subarray(cumulativeLength,cumulativeLength+RawPacket[cumulativeLength])
        processType(ActiveType,ActivePacket.subarray(3,ActivePacket.length), Obj)
        cumulativeLength = cumulativeLength + RawPacket[cumulativeLength]
    }

}
function processType(Type:number,data:Buffer, ServerObj:ServerObject){
    //Likely we will just need a large switch case to  deal with all of the diffrent Packets
    //This is probably easiest to do by abstractig it away in a seperate file but we will 
    //Attempt on small scale here
    let i:number = 0
    let response:Array<any>
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
        //----------------------------------------
        //          ABOVE IS WHAT WE CAN SEND
        //          BELOW  WE RECEIVE
        //----------------------------------------
        case PacketType.ADMIN_PACKET_SERVER_FULL:
            console.log(Packets.SERVER_FULL(data))
            break
        case PacketType.ADMIN_PACKET_SERVER_BANNED:
            console.log(Packets.SERVER_BANNED(data))
            break
        case PacketType.ADMIN_PACKET_SERVER_ERROR:
            console.log(Packets.SERVER_ERROR(data))
            break
        case PacketType.ADMIN_PACKET_SERVER_PROTOCOL:
            response = Packets.SERVER_PROTOCOL(data)
            break
        case PacketType.ADMIN_PACKET_SERVER_WELCOME:
            response = Packets.SERVER_WELCOME(data)
            ServerObj.ServerName = response[0]
            ServerObj.ServerVersion = response[1]
            ServerObj.DedicatedFlag = response[2]
            ServerObj.MapName = response[3]
            ServerObj.MapSeed = response[4]
            ServerObj.Landscape = response[5].value
            ServerObj.StartDate = response[6]
            ServerObj.MapWidth = response[7]
            ServerObj.MapHeight = response[8]
            break
        case PacketType.ADMIN_PACKET_SERVER_NEWGAME:
            response = Packets.SERVER_NEWGAME(data)
            break
        case PacketType.ADMIN_PACKET_SERVER_SHUTDOWN:
            console.log(Packets.SERVER_SHUTDOWN(data))
            break
        case PacketType.ADMIN_PACKET_SERVER_DATE:
            response = Packets.SERVER_DATE(data)
            ServerObj.CurrentDate = response[0]
            break
        case PacketType.ADMIN_PACKET_SERVER_CLIENT_JOIN:
            response = Packets.SERVER_CLIENT_JOIN(data)
            console.log(response,"Client?A")
            let NewClient:ClientObject = {
                ID: response[0],
                ClientName:null,
                ClientCompanyID:null,
            }
            ServerObj.Clients.push(NewClient)
            break
        case PacketType.ADMIN_PACKET_SERVER_CLIENT_INFO:
            response = Packets.SERVER_CLIENT_INFO(data)
            let ClientID = response[0]
            let NetworkAddress = response[1]
            let Name =response[2]
            let Language = response[3]
            let JoinDate = response[4]
            let CompanyID = response[5]
            const ValidClient = ServerObj.Clients.find(obj => {
                return obj.ID == ClientID
            })
            if(ValidClient == undefined){
                console.log("This Client has not been accounted for")
                let NewClient:ClientObject = {
                    ID: ClientID,
                    ClientName:Name,
                    ClientCompanyID:CompanyID,
                }
                ServerObj.Clients.push(NewClient)
            }else{
                console.log("This Client can be updated!")
            }
            break
        case PacketType.ADMIN_PACKET_SERVER_CLIENT_UPDATE:
            response = Packets.SERVER_CLIENT_UPDATE(data)
            console.log(response,"Client?C")
            let UpdateClientID = response[0]
            ServerObj.Clients.forEach((Client) => {
                if(Client.ID == UpdateClientID){
                    Client.ClientName = response[1]
                    Client.ClientCompanyID = response[2]
                }
            })
            break
        case PacketType.ADMIN_PACKET_SERVER_CLIENT_QUIT:
            response = Packets.SERVER_CLIENT_QUIT(data)
            console.log(response,"Client?D")
            let RemovalClientID:number = response[0]
            i = 0
            ServerObj.Clients.forEach((Client,index) => {
                if(RemovalClientID == Client.ID){
                    i = index
                }
            })
            ServerObj.Clients.splice(i)
            break
        case PacketType.ADMIN_PACKET_SERVER_CLIENT_ERROR:
            response = Packets.SERVER_CLIENT_ERROR(data)
            console.log(response,"Client?E")
            break
        case PacketType.ADMIN_PACKET_SERVER_COMPANY_NEW:
            response = Packets.SERVER_COMPANY_NEW(data)
            console.log(response,"Comapny?A")
            let NewCompanyEconomy:CompanyEconomyObject = {
                Money:0,
                Loan:0,
                Income:0,
                ThisDeliveredCargo:0,
                LastCompanyValue:0,
                LastPerformance:0,
                LastDeliveredCargo:0,
                PrevCompanyValue:0,
                PrevPerformance:0,
                PrevDeliveredCargo:0
            }
            let NewCompanyStats:CompanyStatsObject = {
                Trains:0,
                Lorries:0,
                Busses:0,
                Planes:0,
                Ships:0,
                TrainStations:0,
                LorryStations:0,
                BusStops:0,
                AirPorts:0,
                Harbours:0
            }
            let NewCompany:CompanyObject = {
                ID: response[0],
                CompanyName: null,
                ManagerName: null,
                Color: null,
                PasswordFlag: null,
                Share1:null,
                Share2:null,
                Share3:null,
                Share4:null,
                Economy: NewCompanyEconomy,
                Stats: NewCompanyStats
            }
            
            ServerObj.Companies.push(NewCompany)
            break
        case PacketType.ADMIN_PACKET_SERVER_COMPANY_INFO:
            response = Packets.SERVER_COMPANY_INFO(data)
            console.log(response,"Comapny?B")
            break
        case PacketType.ADMIN_PACKET_SERVER_COMPANY_UPDATE:
            response = Packets.SERVER_COMPANY_UPDATE(data)
            console.log(response,"Comapny?C")
            let UpdateCompanyID:number = response[0]
            ServerObj.Companies.forEach((Company) => {
                if(UpdateCompanyID==Company.ID){
                    Company.CompanyName = response[1],
                    Company.ManagerName = response[2],
                    Company.Color = response[3],
                    Company.PasswordFlag = response[4],
                    Company.Share1 = response[5],
                    Company.Share2 = response[6],
                    Company.Share3 = response[7],
                    Company.Share4 = response[8]
                }
            })

            break
        case PacketType.ADMIN_PACKET_SERVER_COMPANY_REMOVE:
            response = Packets.SERVER_COMPANY_REMOVE(data)
            console.log(response,"Comapny?D")
            let RemovalCompanyID:number = response[0]
            i = 0
            ServerObj.Companies.forEach((Company,index) => {
                if(RemovalCompanyID == Company.ID){
                    i = index
                }
            })
            ServerObj.Companies.splice(i)
            break
        case PacketType.ADMIN_PACKET_SERVER_COMPANY_ECONOMY:
            response = Packets.SERVER_COMPANY_ECONOMY(data)
            let EconomyCompanyID:number = response[0]
            ServerObj.Companies.forEach((Company) => {
                if(EconomyCompanyID == Company.ID){
                    Company.Economy.Money = response[1]
                    Company.Economy.Loan = response[2]
                    Company.Economy.Income = response[3]
                    Company.Economy.ThisDeliveredCargo = response[4]
                    Company.Economy.LastCompanyValue = response[5]
                    Company.Economy.LastPerformance = response[6]
                    Company.Economy.LastDeliveredCargo = response[7]
                    Company.Economy.PrevCompanyValue = response[8]
                    Company.Economy.PrevPerformance = response[9]
                    Company.Economy.PrevDeliveredCargo = response[10]
                }
            })
            break
        case PacketType.ADMIN_PACKET_SERVER_COMPANY_STATS:
            response = Packets.SERVER_COMPANY_STATS(data)
            let StatsCompanyID:number = response[0]
            ServerObj.Companies.forEach((Company) => {
                if(StatsCompanyID == Company.ID){
                    Company.Stats.Trains = response[1]
                    Company.Stats.Lorries = response[2]
                    Company.Stats.Busses = response[3]
                    Company.Stats.Planes = response[4]
                    Company.Stats.Ships = response[5]
                    Company.Stats.TrainStations = response[6]
                    Company.Stats.LorryStations = response[7]
                    Company.Stats.BusStops = response[8]
                    Company.Stats.AirPorts = response[9]
                    Company.Stats.Harbours = response[10]
                }
            })
            break
        case PacketType.ADMIN_PACKET_SERVER_CHAT:
            console.log(Packets.SERVER_CHAT(data))
            break
        case PacketType.ADMIN_PACKET_SERVER_RCON:
            console.log(Packets.SERVER_RCON(data))
            break
        case PacketType.ADMIN_PACKET_SERVER_CONSOLE:
            console.log(Packets.SERVER_CONSOLE(data))
            break
        case PacketType.ADMIN_PACKET_SERVER_CMD_NAMES:
            console.log(Packets.SERVER_CMD_NAMES(data))
            break
        case PacketType.ADMIN_PACKET_SERVER_CMD_LOGGING_OLD:
            console.log(Packets.SERVER_CMD_LOGGING_OLD(data))
            break
        case PacketType.ADMIN_PACKET_SERVER_GAMESCRIPT:
            console.log(Packets.SERVER_GAMESCRIPT(data))
            break
        case PacketType.ADMIN_PACKET_SERVER_RCON_END:
            console.log(Packets.SERVER_RCON_END(data))
            break
        case PacketType.ADMIN_PACKET_SERVER_PONG:
            console.log(Packets.SERVER_PONG(data))
            break
        case PacketType.ADMIN_PACKET_SERVER_CMD_LOGGING:
            console.log(Packets.SERVER_CMD_LOGGING(data))
        default:
          console.log(`The Packet TYpe ${Type} is not yet accounted for`)
      }
}
//--MAIN--
//Create a socket to be used for connection

export function createConnection(UUID:number,HOST:string,PORT:number,PASS:string,NAME:string,VERISON:string):[net.Socket, ServerObject]{
    let ServerObj:ServerObject = Object.assign({},ServerObjProtoType)
    ServerObj.UUID = UUID
    let socket = new net.Socket();
    //Connect to the open and active OpenTTD Server
    socket.connect(PORT, HOST, function() {
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
        socket.write(Buffer.from([0x07, 0x00, 0x02, AdminUpdateType.Date, 0x00, AdminUpdateFrequency.Weekly, 0x00]))            //DATE             | WEEKLY
        socket.write(Buffer.from([0x07, 0x00, 0x02, AdminUpdateType.ClientInfo, 0x00, AdminUpdateFrequency.Automatic, 0x00]))   //CLIENT INFO      | AUTOMATIC
        socket.write(Buffer.from([0x07, 0x00, 0x02, AdminUpdateType.CompanyInfo, 0x00, AdminUpdateFrequency.Automatic, 0x00]))  //COMPANY INFO     | AUTOMATIC
        socket.write(Buffer.from([0x07, 0x00, 0x02, AdminUpdateType.CompanyEcon, 0x00, AdminUpdateFrequency.Quarterly, 0x00]))  //COMPANY ECONOMY  | QUARTERLY
        socket.write(Buffer.from([0x07, 0x00, 0x02, AdminUpdateType.CompanyStats, 0x00, AdminUpdateFrequency.Anually, 0x00]))   //COMPANY STATS    | ANNUALY
    });
    socket.on('data', function(data) {
        //everytime the socket receives data, this event is triggered
        //Everytime Event is triggered we need to process the data
        //Mulitple Packets coould arrive in single event
        //For this reason we will need to use the SIZE to seperate Packets
        processPacket(data,ServerObj)

    });
    socket.on('error', (err) => {
        console.log(err.message, "We should Ping the Disconnect/Error EndPoint when we error")
        http.get(`http://localhost:3000/socket/${UUID}/error`)
        return([null,null])
    })
    // Add a 'close' event handler for the client socket
    socket.on('close', function() {
        console.log("Connection Closed")
    });
    return([socket,ServerObj])
}
