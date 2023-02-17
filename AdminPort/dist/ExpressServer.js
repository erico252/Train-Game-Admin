"use strict";
exports.__esModule = true;
var AdminPortAPI_1 = require("./AdminPortAPI");
var Constants_1 = require("./Constants");
var express = require("express");
var app = express();
var UUID = 0;
var arraySockets = [];
//--ROUTES--
app.get("/", function (req, res) {
    res.send("RESTful API for OpenTTD implemented via NodeJS");
});
app.get("/connect", function (req, res) {
    console.log("Creating a new Socket Connection");
    var ConnectionInfo = (0, AdminPortAPI_1.createConnection)(UUID, req.query.IP, req.query.PORT, req.query.PASS, req.query.BOT, req.query.VERSION);
    arraySockets.push({
        ID: UUID,
        Socket: ConnectionInfo[0],
        Data: ConnectionInfo[1]
    });
    res.json({
        IP: req.query.IP,
        PORT: req.query.PORT,
        PASS: req.query.PASS,
        BOT: req.query.BOT,
        VERSION: req.query.VERSION
    });
    UUID = UUID + 1;
});
app.get("/sockets", function (req, res) {
    res.json({
        SocketList: arraySockets
    });
});
app.get("/server/:ID", function (req, res) {
    var data;
    arraySockets.forEach(function (connection) {
        if (connection.ID == req.params["ID"]) {
            data = { data: connection.Data };
            data.IP = connection.Socket.address();
        }
    });
    res.json(data);
});
app.get("/update/", function (req, res) {
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
