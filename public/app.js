"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var socketIO = require("socket.io");
var path = require("path");
var UUIDV1 = require("uuid/v1");
var PORT = process.env.PORT || 3000;
var root = path.resolve(__dirname, '..');
var INDEX = path.join(__dirname, '/index.html');
var http = express()
    .use(express.static('/*'))
    .get('/', function (req, res) { return res.sendFile(INDEX); })
    .get('/*', function (req, res, next) { return res.sendFile(__dirname + '/' + req.params[0]); })
    .listen(PORT, function () { return console.log("Listening on " + PORT); });
var io = socketIO(http);
var Server_1 = require("./scripts/server/Server");
var Map_1 = require("./scripts/Map/Map");
var Pickups_1 = require("./scripts/Pickups/Pickups");
var Timer_1 = require("./scripts/common/Timer");
var FileSystem = require("fs");
global.pickups = new Pickups_1.default();
global.time = new Timer_1.default();
global.server = new Server_1.default(io);
FileSystem.readdirSync(__dirname + '/maps/').forEach(function (file) {
    var mapPath = __dirname + '/maps/' + file;
    var map = new Map_1.default().parseMap(JSON.parse(FileSystem.readFileSync(mapPath).toString()));
    var mapInfo = {
        id: UUIDV1(),
        name: map.name,
        gameType: map.gameType,
        maxPlayers: map.maxPlayers,
        width: map.width,
        height: map.height,
        mapData: map.data,
        path: mapPath
    };
    var mapInfoForClients = {
        id: mapInfo.id,
        name: mapInfo.name,
        gameType: mapInfo.gameType,
        maxPlayers: mapInfo.maxPlayers
    };
    server.mapsInfo.push(mapInfo);
    server.mapsInfoForClients.push(mapInfoForClients);
});
io.on('connection', function (socket) {
    server.welcome(socket);
    socket.on('join', function (clientData) {
        server.createClient(socket, clientData);
    });
    socket.on('shoot', function (projectile) {
        server.shootBullet(projectile);
    });
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
    server.update();
}, 1000 / 60);
setInterval(function () {
    server.notifyClients();
}, 100);
