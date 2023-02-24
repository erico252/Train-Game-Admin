"use strict";
exports.__esModule = true;
var AdminPortAPI_1 = require("./AdminPortAPI");
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
function FindServer(Array, res, req, CallBackFn) {
    var Data = Array.find(function (obj) {
        return obj.ID == req.params["ID"];
    });
    if (Data == undefined) {
        res.sendStatus(404);
    }
    else {
        CallBackFn(Data, res);
    }
}
//--ROUTES--
app.get("/", function (req, res) {
    res.json({
        Endpoints: {
            socket: [
                { "": "Show Text" },
                { list: "List all connections" },
                { connect: "Make a connection to a server" },
                { ":ID/disconnect": "Remove a connection" },
                { ":ID/error": "An Error Occured on Socket, Remove it" }
            ],
            server: [
                { "": "Show Text" },
                { list: "List all servers in form of ID and Data" },
                { ":ID": "Get all data for Given Server ID" },
                { ":ID/companies": "List all companies of given server ID" },
                { ":ID/clients": "List all clients of a given server ID" },
                { ":ID/query": "Create an update request for given server ID" }
            ]
        }
    });
});
var arraySockets = [];
app.get("/socket", function (req, res) {
    res.send("The Socket endpoints deal with the raw bot connections");
});
app.get("/socket/list", function (req, res) {
    res.json({ list: arraySockets });
});
app.post("/socket/connect", function (req, res) {
    var data = req.body;
    var BotName = "EricsBot";
    var Version = "1.0";
    var ConnectionInfo = (0, AdminPortAPI_1.createConnection)(UUID, data.IP, data.PORT, data.PASS, BotName, Version);
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
        BOT: BotName,
        VERSION: Version
    });
    UUID = UUID + 1;
});
app.get("/socket/:ID/disconnect", function (req, res) {
    FindServer(arraySockets, res, req, function (serverData, res) {
        if (serverData == undefined) {
            res.sendStatus(404);
        }
        else {
            serverData.Socket.end(Buffer.from(new Uint8Array([0x03, 0x00, 0x01])), function () { console.log("Ending This Connection"); });
            arraySockets.splice(arraySockets.indexOf(serverData), 1);
            res.sendStatus(200);
        }
    });
});
app.get("/socket/:ID/error", function (req, res) {
    FindServer(arraySockets, res, req, function (serverData, res) {
        if (serverData == undefined) {
            res.sendStatus(404);
        }
        else {
            serverData.Socket.end(Buffer.from(new Uint8Array([0x03, 0x00, 0x01])), function () { console.log("Ending This Connection"); });
            arraySockets.splice(arraySockets.indexOf(serverData), 1);
            res.sendStatus(200);
        }
    });
});
app.get("/server", function (req, res) {
    res.send("The Server Endpoints Deal with individual Server Data based on ID");
});
app.get("/server/list", function (req, res) {
    var data = arraySockets.map(function (val) {
        return ([val.ID, val.Data]);
    });
    res.json({
        data: data
    });
});
app.get("/server/:ID/companies", function (req, res) {
    FindServer(arraySockets, res, req, function (serverData, res) {
        console.log(serverData.Data.Companies);
        res.json({
            list: serverData.Data.Companies
        });
    });
});
app.get("/server/:ID/clients", function (req, res) {
    FindServer(arraySockets, res, req, function (serverData, res) {
        console.log(serverData.Data.Clients);
        res.json({
            list: serverData.Data.Clients
        });
    });
});
app.post("/server/:ID/query", function (req, res) {
    var info = req.body;
    console.log("Query", info.UpdateType, info.UpdateFrequency);
    FindServer(arraySockets, res, req, function (serverData, res) {
        if (info.UpdateFrequency == 1) {
            serverData.Socket.write((0, AdminPortAPI_1.createPollPacket)(info.UpdateType, 0xffffffff));
        }
        else {
            serverData.Socket.write((0, AdminPortAPI_1.createUpdatePacket)(info.UpdateType, info.UpdateFrequency));
        }
        res.sendStatus(200);
    });
});
app.get("/server/:ID", function (req, res) {
    FindServer(arraySockets, res, req, function (serverData, res) {
        res.json({
            id: serverData.ID,
            data: serverData.Data
        });
    });
});
/*
app.all('*', (req, res) => {
    console.log("The Path didnt exist, redirecting")
    res.redirect("/")
})
*/
app.listen("3000", function () {
    console.log("Server listening on 3000");
});
