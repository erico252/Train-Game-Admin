import { createConnection, createUpdatePacket } from "./AdminPortAPI";
import * as net from "net";
import { AdminUpdateType, AdminUpdateFrequency } from "./Constants";
import { ServerObject } from "./Interfaces";
const express = require("express");
const bodyParser = require('body-parser')
var cors = require('cors')
const app = express();
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(function (req,res,next) {
    console.log(req.url, "and", req.method)
    next()
})

interface SocketsConnections{
    ID:number
    Socket:net.Socket
    Data:ServerObject
}
interface ConnectionRequest{
    PASS: string,
    IP:string,
    PORT:number
}

let UUID:number  = 0


//--ROUTES--
app.get("/", (req,res) => { // A Splash for API
    res.send("RESTful API for OpenTTD implemented via NodeJS \n \n http://localhost:3000/connect?IP=127.0.0.1&PORT=3977&PASS=Eric&BOT=Name&VERSION=1.0 \n /sockets \n /server/[ID]")
    
})
let arraySockets:Array<SocketsConnections> = []
app.post("/connect", (req,res) => {
    let data:ConnectionRequest = req.body
    let ConnectionInfo:[net.Socket, ServerObject] = createConnection(UUID,data.IP,data.PORT,data.PASS,"EricsBot","1.0")
    arraySockets.push({
        ID: UUID,
        Socket: ConnectionInfo[0],
        Data: ConnectionInfo[1]
    })
    res.json({
        ID: UUID,
        IP: data.IP,
        PORT: data.PORT,
        PASS: data.PASS,
        BOT: "EricsBot",
        VERSION: "1.0"
    })
    UUID = UUID + 1
})
app.get("/sockets", (req,res) => {
    if(arraySockets.length==0){
        res.json({
            SocketList:[]
        })
    }else{
        res.json({
            SocketList: arraySockets
        })
    }
})
app.get("/Server", (req,res) => {
    res.json(
        {Yellow:"Bannana"}
    )
})
app.post("/Server/Companies", (req,res) => {
    let info = req.body
    let response = new Array
    arraySockets.forEach((connection) => {
        if(connection.ID == info.ID){
            response = connection.Data.Clients
        }
    })
    res.json({
        CompaniesList:response
    })
})
app.post("/Server/Clients", (req,res) => {
    let info = req.body
    let response = new Array
    arraySockets.forEach((connection) => {
        if(connection.ID == info.ID){
            console.log("Found The SERVER ID")
            response = connection.Data.Clients
        }
    })
    console.log(response)
    res.json({
        ClientList:response
    })
})
interface POSTServerUpdates{
    ID:number,
    UpdateType:number,
    UpdateFrequency:number
}
app.post("/Server/Updates", (req,res) => {
    let info:POSTServerUpdates = req.body
    arraySockets.forEach((connection) => {
        if(connection.ID == info.ID){
            console.log("Found The SERVER ID")
            let activeSocket:net.Socket = connection.Socket
            activeSocket.write(createUpdatePacket(info.UpdateType, info.UpdateFrequency))
            res.sendStatus(200)
        }
    })
    if(activeSocket==null){
        res.sendStatus(201)
    }else{
        
    }
    
})
app.get("/server/:ID", (req,res) => {
    let data
    arraySockets.forEach((connection) => {
        if(connection.ID == req.params["ID"]){
            data = {data:connection.Data}
            data.IP = connection.Socket.remoteAddress
        }
    })
    res.json(
        data
    )
})
app.get("/update",(req,res) => {
    //Packet Format is SIZE SIZE TYPE DATA 
    //ADMIN_PACKET_UPDATE_FREQUENCY = 0x02
    //Frequenices are
    
    // 0,Automatic,Anually,Quarterly Monthly,Weekly,Daily,Poll
    let temp:Buffer = Buffer.from([0x07,0x00,0x02,AdminUpdateType[req.query.TYPE],0x00,AdminUpdateFrequency[req.query.FREQ],0x00])
    arraySockets.forEach((socket) => {
        if (socket.ID == req.query.ID){
            socket.Socket.write(temp);
        }
    })
    
    console.log("writing to Server",temp)
    res.json({
        Freqs:AdminUpdateType,
        Types:AdminUpdateFrequency
    })
})







app.listen("3000", () => {
    console.log(`Server listening on 3000`);
  });