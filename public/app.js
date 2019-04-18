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
    .get('/', function (req, res) {
    if (typeof (req.query.admin) == 'string')
        return res.sendFile(__dirname + '/admin.html');
    else
        return res.sendFile(INDEX);
}).get('/*', function (req, res, next) { return res.sendFile(__dirname + '/' + req.params[0]); })
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
    var fakeLag = false;
    var lagValue = Math.floor(300 + 20 * Math.random());
    socket.on('askToJoin', function (clientData) {
        server.createClient(socket, clientData);
    });
    socket.on('shoot', function (projectile) {
        if (fakeLag) {
            setTimeout(function () {
                server.shootProjectile(projectile);
            }, lagValue);
        }
        else {
            server.shootProjectile(projectile);
        }
    });
    socket.on('hitCheck', function (projectileData) {
        if (fakeLag) {
            setTimeout(function () {
                server.hitCheckProjectile(projectileData);
            }, lagValue);
        }
        else {
            server.hitCheckProjectile(projectileData);
        }
    });
    socket.on('update', function (movementData) {
        if (fakeLag) {
            setTimeout(function () {
                server.updateClient(socket, movementData);
            }, lagValue);
        }
        else {
            server.updateClient(socket, movementData);
        }
    });
    socket.on('disconnect', function () {
        if (fakeLag) {
            setTimeout(function () {
                server.deleteClient(socket);
            }, lagValue);
        }
        else {
            server.deleteClient(socket);
        }
    });
    socket.on('pingtest', function () {
        if (fakeLag) {
            setTimeout(function () {
                socket.emit('pongtest');
            }, lagValue);
        }
        else {
            socket.emit('pongtest');
        }
    });
    // admin stuff
    socket.on('admin', function () {
        socket.emit('admin', server.lobbies);
    });
    socket.on('kick', function (socketId) {
        io.sockets.connected[socketId].disconnect(true);
        socket.emit('admin', server.lobbies);
    });
});
setInterval(function () {
    server.update();
}, 1000 / 60);
setInterval(function () {
    server.updateClients();
}, 100);
