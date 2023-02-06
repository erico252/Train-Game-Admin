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
var net = require('net');
const express = require("express");
const app = express();



//--GLOBALS--
const HOST:string = '127.0.0.1';
const PORT:number = 3977;
let RawReceivedPacket:Buffer


//--INTERFACES--


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
        ActivePacket = RawPacket.slice(cumulativeLength,cumulativeLength+RawPacket[cumulativeLength])
        processType(ActiveType,ActivePacket.slice(3,ActivePacket.length))
        cumulativeLength = cumulativeLength + RawPacket[cumulativeLength]
    }

}
function processType(Type:number,data:Buffer){
    //Likely we will just need a large switch case to  deal with all of the diffrent Packets
    //This is probably easiest to do by abstractig it away in a seperate file but we will 
    //Attempt on small scale here
    switch (Type) {
        case 103://ADMIN Protocol
          console.log(data);
          break;
        case 104:
          console.log(data);
          // Expected output: "Mangoes and papayas are $2.79 a pound."
          break;
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

app.get("/connect",(req,res) => {
 let data = {key:"value"}
    res.json(data)
})







app.listen("3000", () => {
    console.log(`Server listening on 3000`);
  });