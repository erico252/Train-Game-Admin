import { createConnection } from "./AdminPortAPI";
import * as net from "net";
import { AdminUpdateType, AdminUpdateFrequency } from "./Constants";
import { ServerObject, Sockets } from "./Interfaces";
const express = require("express");
const app = express();

let UUID:number  = 0

let arraySockets:Array<Sockets> = []
//--ROUTES--
app.get("/", (req,res) => { // A Splash for API
    res.send("RESTful API for OpenTTD implemented via NodeJS")
    
})
app.get("/connect", (req,res) => {
    console.log("Creating a new Socket Connection")
    let ConnectionInfo = createConnection(UUID,req.query.IP,req.query.PORT,req.query.PASS,req.query.BOT,req.query.VERSION)
    arraySockets.push({
        ID: UUID,
        Socket: ConnectionInfo[0],
        Data: ConnectionInfo[1]
    })
    res.json({
        IP: req.query.IP,
        PORT: req.query.PORT,
        PASS: req.query.PASS,
        BOT: req.query.BOT,
        VERSION: req.query.VERSION
    })
    UUID = UUID + 1
})
app.get("/sockets", (req,res) => {
    res.json({
        SocketList: arraySockets
    })
})

app.get("/server/:ID", (req,res) => {
    let data
    arraySockets.forEach((connection) => {
        if(connection.ID == req.params["ID"]){
            data = {data:connection.Data}
            data.IP = connection.Socket.address()
        }
    })
    res.json(
        data
    )
})
app.get("/update/",(req,res) => {
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