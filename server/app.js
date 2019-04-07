"use strict";
exports.__esModule = true;
var express = require("express");
var socketIO = require("socket.io");
var path = require("path");
var PORT = process.env.PORT || 3000;
var INDEX = path.join(__dirname, './public/index.html');
var http = express()
    .use(express.static('/*'))
    .get('/', function (req, res) { return res.sendFile(INDEX); })
    .get('/*', function (req, res, next) { return res.sendFile(__dirname + '/public/' + req.params[0]); })
    .listen(PORT, function () { return console.log("Listening on " + PORT); });
var io = socketIO(http);
var app_server_1 = require("./app.server");
var Map_1 = require("../common/Map");
var Timer_1 = require("../common/Timer");
var FileSystem = require("fs");
global.map = new Map_1["default"]();
map.parseMap(JSON.parse(FileSystem.readFileSync("./map.json").toString()));
global.time = new Timer_1["default"]();
global.server = new app_server_1["default"](io);
io.on('connection', function (socket) {
    server.createClient(socket);
    socket.on('update', function (movementData) {
        server.updateClient(socket, movementData);
    });
    socket.on('disconnect', function () {
        server.deleteClient(socket);
    });
    socket.on('pingtest', function () {
        socket.emit('pongtest');
    });
});
setInterval(function () {
    time.update();
}, 1000 / 60);
setInterval(function () {
    server.notifyClients();
}, 100);
