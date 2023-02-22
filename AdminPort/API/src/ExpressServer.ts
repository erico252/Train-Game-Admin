import { createConnection, createUpdatePacket } from "./AdminPortAPI";
import * as net from "net";
import { AdminUpdateType, AdminUpdateFrequency } from "./Constants";
import { ServerObject, ClientObject, CompanyEconomyObject, CompanyObject, CompanyStatsObject } from "./Interfaces";
import { version } from "typescript";
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

function FindServer(Array:Array<SocketsConnections>,res,req, CallBackFn){
    const Data = Array.find(obj => {
        obj.ID == req["ID"]
    })
    if(Data == undefined){
        res.sendStatus(404)
    }else{
        CallBackFn(Data,res)
    }
}

//--ROUTES--

app.get("/", (req,res) => { // A Splash for API
    res.send("EndPoints /socket /socket/list /socket/connect /socket:ID/disconnect /server /server/list /server/:ID /server/:ID/companies /server/:ID/clients /server/:ID/query")   
})
let arraySockets:Array<SocketsConnections> = []
app.get("/socket", (req,res) => {
    res.send("The Socket endpoints deal with the raw bot connections")
})
app.get("/socket/list", (req,res) => {
    res.json({socketList:arraySockets})
})
app.post("/socket/connect", (req,res) => {
    let data:ConnectionRequest = req.body
    let BotName = "EricsBot"
    let Version = "1.0"
    let ConnectionInfo:[net.Socket, ServerObject] = createConnection(UUID,data.IP,data.PORT,data.PASS,BotName,Version)
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
        BOT: BotName,
        VERSION: Version
    })
    UUID = UUID + 1 
})
app.post("/socket/:ID/disconnect", (req,res) => {
    const serverData = arraySockets.find(obj => {
        obj.ID == req["ID"]
    })
    if(serverData == undefined){
        res.sendStatus(404)
    }else{
        serverData.Socket.end(Buffer.from(new Uint8Array([0x03, 0x00, 0x01])),()=>{console.log("Ending This Connection")})
        arraySockets.splice(arraySockets.indexOf(serverData),1)
        res.sendStatus(200)
    }
})
app.get("/server", (req,res) => {
    res.send("The Server Endpoints Deal with individual Server Data based on ID")
})
app.get("/server/list",(req,res)=>{
    let data = arraySockets.map((val) => {
        return([val.ID,val.Data])
    })
    res.json({
        data:data
    })
})
app.get("/server/:ID/companies", (req,res) => {
    FindServer(arraySockets,res,req,(serverData,res) =>{
        res.json({
            response:serverData.Data.Companies
        })
    })
})
app.get("/server/:ID/clients", (req,res) => {
    FindServer(arraySockets,res,req,(serverData,res) =>{
        res.json({
            response:serverData.Data.Companies
        })
    })
})
interface POSTServerUpdates{
    ID:number,
    UpdateType:number,
    UpdateFrequency:number
}
app.post("/server/:ID/query", (req,res) => {
    let info:POSTServerUpdates = req.body
    FindServer(arraySockets,res,req,(serverData:SocketsConnections,res) =>{
        serverData.Socket.write(createUpdatePacket(info.UpdateType, info.UpdateFrequency))
        res.sendStatus(200)
    })
})
app.get("/server/:ID", (req,res) => {
    FindServer(arraySockets,res,req,(serverData:SocketsConnections,res) =>{
        res.json({
            id:serverData.ID,
            data:serverData.Data
        })
    })
})

app.listen("3000", () => {
    console.log(`Server listening on 3000`);
  });