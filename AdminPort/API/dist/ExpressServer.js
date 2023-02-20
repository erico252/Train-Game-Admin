"use strict";
exports.__esModule = true;
var AdminPortAPI_1 = require("./AdminPortAPI");
var Constants_1 = require("./Constants");
var express = require("express");
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function (req, res, next) {
    console.log(req.url, "and", req.method);
    next();
});
var UUID = 0;
//--ROUTES--
app.get("/", function (req, res) {
    res.send("RESTful API for OpenTTD implemented via NodeJS \n \n http://localhost:3000/connect?IP=127.0.0.1&PORT=3977&PASS=Eric&BOT=Name&VERSION=1.0 \n /sockets \n /server/[ID]");
});
var arraySockets = [];
app.post("/connect", function (req, res) {
    var data = req.body;
    var ConnectionInfo = (0, AdminPortAPI_1.createConnection)(UUID, data.IP, data.PORT, data.PASS, "EricsBot", "1.0");
    arraySockets.push({
        ID: UUID,
        Socket: ConnectionInfo[0],
        Data: ConnectionInfo[1]
    });
    res.json({
        ID: UUID,
        IP: data.IP,
        PORT: data.PORT,
        PASS: data.PASS,
        BOT: "EricsBot",
        VERSION: "1.0"
    });
    UUID = UUID + 1;
});
app.get("/sockets", function (req, res) {
    if (arraySockets.length == 0) {
        res.json({
            SocketList: []
        });
    }
    else {
        res.json({
            SocketList: arraySockets
        });
    }
});
app.get("/Server", function (req, res) {
    res.json({ Yellow: "Bannana" });
});
app.post("/Server/Companies", function (req, res) {
    var info = req.body;
    var response = new Array;
    arraySockets.forEach(function (connection) {
        if (connection.ID == info.ID) {
            response = connection.Data.Clients;
        }
    });
    res.json({
        CompaniesList: response
    });
});
app.post("/Server/Clients", function (req, res) {
    var info = req.body;
    var response = new Array;
    arraySockets.forEach(function (connection) {
        if (connection.ID == info.ID) {
            console.log("Found The SERVER ID");
            response = connection.Data.Clients;
        }
    });
    console.log(response);
    res.json({
        ClientList: response
    });
});
app.post("/Server/Updates", function (req, res) {
    var info = req.body;
    arraySockets.forEach(function (connection) {
        if (connection.ID == info.ID) {
            console.log("Found The SERVER ID");
            var activeSocket = connection.Socket;
            activeSocket.write((0, AdminPortAPI_1.createUpdatePacket)(info.UpdateType, info.UpdateFrequency));
            res.sendStatus(200);
        }
    });
    if (activeSocket == null) {
        res.sendStatus(201);
    }
    else {
    }
});
app.get("/server/:ID", function (req, res) {
    var data;
    arraySockets.forEach(function (connection) {
        if (connection.ID == req.params["ID"]) {
            data = { data: connection.Data };
            data.IP = connection.Socket.remoteAddress;
        }
    });
    res.json(data);
});
app.get("/update", function (req, res) {
    //Packet Format is SIZE SIZE TYPE DATA 
    //ADMIN_PACKET_UPDATE_FREQUENCY = 0x02
    //Frequenices are
    // 0,Automatic,Anually,Quarterly Monthly,Weekly,Daily,Poll
    var temp = Buffer.from([0x07, 0x00, 0x02, Constants_1.AdminUpdateType[req.query.TYPE], 0x00, Constants_1.AdminUpdateFrequency[req.query.FREQ], 0x00]);
    arraySockets.forEach(function (socket) {
        if (socket.ID == req.query.ID) {
            socket.Socket.write(temp);
        }
    });
    console.log("writing to Server", temp);
    res.json({
        Freqs: Constants_1.AdminUpdateType,
        Types: Constants_1.AdminUpdateFrequency
    });
});
app.listen("3000", function () {
    console.log("Server listening on 3000");
});
