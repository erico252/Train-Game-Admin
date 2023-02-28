import { createConnection, createPollPacket, createUpdatePacket } from "./AdminPortAPI";
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
        return obj.ID == req.params["ID"]
    })
    if(Data == undefined){
        res.sendStatus(404)
    }else{
        CallBackFn(Data,res)
    }
}

//--ROUTES--

app.get("/", (req,res) => { // A Splash for API
    res.json({
        Endpoints:{
            socket:[
                {"":"Show Text"},
                {list:"List all connections"},
                {connect:"Make a connection to a server"},
                {":ID/disconnect":"Remove a connection"},
                {":ID/error":"An Error Occured on Socket, Remove it"}
            ],
            server:[
                {"":"Show Text"},
                {list:"List all servers in form of ID and Data"},
                {":ID":"Get all data for Given Server ID"},
                {":ID/companies":"List all companies of given server ID"},
                {":ID/clients":"List all clients of a given server ID"},
                {":ID/query":"Create an update request for given server ID"},
                {":ID/poll":"Create a poll request for given server ID"}
            ]
        }
    })   
})
let arraySockets:Array<SocketsConnections> = []
app.get("/socket", (req,res) => {
    res.send("The Socket endpoints deal with the raw bot connections")
})
app.get("/socket/list", (req,res) => {
    try{
        res.json({list:arraySockets})
    }catch{
        console.log("We have a problem")
        res.json({list:"Broken"})
    }
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
app.get("/socket/:ID/disconnect", (req,res) => {
    FindServer(arraySockets,res,req,(serverData,res) =>{
        if(serverData == undefined){
            res.sendStatus(404)
        }else{
            serverData.Socket.end(Buffer.from(new Uint8Array([0x03, 0x00, 0x01])),()=>{console.log("Ending This Connection")})
            arraySockets.splice(arraySockets.indexOf(serverData),1)
            res.sendStatus(200)
        }
    })
    
})
app.get("/socket/:ID/error",(req,res) => {
    FindServer(arraySockets,res,req,(serverData,res) =>{
        if(serverData == undefined){
            res.sendStatus(404)
        }else{
            serverData.Socket.end(Buffer.from(new Uint8Array([0x03, 0x00, 0x01])),()=>{console.log("Ending This Connection")})
            arraySockets.splice(arraySockets.indexOf(serverData),1)
            res.sendStatus(200)
        }
    })
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
    FindServer(arraySockets,res,req,(serverData:SocketsConnections,res) =>{
        console.log(serverData.Data.Companies.map((Company)=>{
            return([Company.CompanyName,Company.ID])
        }))
        res.json({
            list:serverData.Data.Companies
        })
    })
})
app.get("/server/:ID/clients", (req,res) => {

    FindServer(arraySockets,res,req,(serverData:SocketsConnections,res) =>{
        console.log(serverData.Data.Clients)
        
        res.json({
            list:serverData.Data.Clients
        })
    })
})
interface POSTServerQuery{
    UpdateType:number,
    UpdateFrequency:number
}
app.post("/server/:ID/query", (req,res) => {
    let info:POSTServerQuery = req.body
    console.log("Query",info.UpdateType, info.UpdateFrequency)
    FindServer(arraySockets,res,req,(serverData:SocketsConnections,res) =>{
        if(info.UpdateFrequency==1){   
            console.log("Wrong Freq")
        }else{
            serverData.Socket.write(createUpdatePacket(info.UpdateType, info.UpdateFrequency))
        }
        
        res.status(200).send(`Query,${info.UpdateType}, ${info.UpdateFrequency}`)
    })
})
interface POSTServerPoll{
    UpdateType:number,
    UpdateFrequency:number,
    UpdateID:number
}
app.post("/server/:ID/poll", (req,res) => {
    let info:POSTServerPoll = req.body
    console.log("Poll",info.UpdateType, info.UpdateID)
    FindServer(arraySockets,res,req,(serverData:SocketsConnections,res) =>{
        if(info.UpdateFrequency==1){ 
            serverData.Socket.write(createPollPacket(info.UpdateType, info.UpdateID))
        }else{
            console.log("Wrong Freq")
        }
        
        res.status(200).send(`Poll,${info.UpdateType}, ${info.UpdateFrequency}`)
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
/*
app.all('*', (req, res) => {
    console.log("The Path didnt exist, redirecting")
    res.redirect("/")
})
*/

app.listen("3000", () => {
    console.log(`Server listening on 3000`);
  });