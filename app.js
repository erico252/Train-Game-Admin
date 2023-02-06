const WebSocket = require('ws')
var WebSocketClient = require('websocket').client;






var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });
    AdminName = "Eric"
    BotName = "Erics Bot"
    Version = "1.0"
    Type = Buffer.alloc(1,0)
    EoS = Buffer.alloc(1,0)
    Size = Buffer.alloc(2,0)
    Data = Buffer.concat([Type,Buffer.from(AdminName),EoS,Buffer.from(BotName),EoS,Buffer.from(Version),EoS])
    console.log(Data, Data.length)
    Size.writeUInt16LE(Data.length+2);
    Packet = Buffer.concat([Size,Data])
    console.log(Packet)
    connection.send(Packet)
});

client.connect('ws://127.0.0.1:3977');