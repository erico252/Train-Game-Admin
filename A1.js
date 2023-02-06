//THIS WORKS
//Now we need a way to dechiper packets
// Each packe structure does 0xSIZE 0xSIZE 0xTYPE 0xDATA... 0xDATA
//but we see that our socket can receive mulitple packets at once
//not sure why this is the case but lets try and seperate our
//data by slicing at the size
//we basically need to cehckthe type and then perform transforms on it
//this can be done in a class?
//in a function?
//i have no idea bet practice to tackle it


var net = require('net');
const express = require("express");
const app = express();
var ServerInfo = "Nothing"
//globals
var HOST = '127.0.0.1';
var PORT = 3977;
var socket = new net.Socket();
app.get("/", (req,res) => { // A Splash for API
    res.send("Refer to BackEnd for endpoints")
    
})

app.get("/OpenTTD/connect",(req,res) => {

    size = ServerInfo[0]
    AdminProtocol = ServerInfo.slice(0,size)
    console.log("AdminProto",AdminProtocol)
    AdminWelcom = ServerInfo.slice(size)
    console.log("Welcome",Buffer.byteLength(AdminWelcom), AdminWelcom)
    data = {
        ServerName:0x00,
        ServerVersion:0x00,
        Dedicated:0x00,
        MapName:0x00,
        Seed:0x00,
        Landscape:0x00,
        StartDate:0x00,
        MapWidth:0x00,
        MapHeight:0x00
    }



    res.json(data)
})
let a = Buffer.from("Eric","utf-8")
    let b = Buffer.from("Erics Bot","utf-8")
    let c = Buffer.from("1.0","utf-8")
    let d = Buffer.concat([
        new Uint8Array([0x16,0x00,0x00]),
        a,
        new Uint8Array([0x00]),
        b,
        new Uint8Array([0x00]),
        c,
        new Uint8Array([0x00])
    ])

socket.connect(PORT, HOST, function() {
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    socket.write(d);
});

socket.on('data', function(data) { // 'data' is an event handler for the client socket, what the server sent
    ServerInfo = Buffer.from(data,"hex")
    //client.destroy(); // Close the client socket completely

});

// Add a 'close' event handler for the client socket
socket.on('close', function() {
    console.log('Connection closed');
});

app.listen("3000", () => {
    console.log(`Server listening on 3000`);
  });