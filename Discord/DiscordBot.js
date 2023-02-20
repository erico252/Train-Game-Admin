//npx tsc .\Discord\DiscordBot.ts -w
var express = require("express");
var app = express();
//--BOT--
var _a = require('discord.js'), Client = _a.Client, Events = _a.Events, GatewayIntentBits = _a.GatewayIntentBits;
var token = require('./config.json').token;
// Create a new client instance
var client = new Client({ intents: [GatewayIntentBits.Guilds] });
// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, function (c) {
    console.log("Ready! Logged in as ".concat(c.user.tag));
});
// Log in to Discord with your client's token
client.login(token);
//--ROUTES--
app.get("/", function (req, res) {
    res.send("RESTful API for DiscordBot implemented via NodeJS");
});
app.listen("3030", function () {
    console.log("Server listening on 3030");
});
