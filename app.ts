import express = require('express');
import socketIO = require('socket.io');
import path = require('path');
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, './public/index.html');
const http = express()
    .use(express.static('/*'))
    .get('/', (req, res) => res.sendFile(INDEX))
    .get('/*', (req, res, next) => res.sendFile(__dirname + '/public/' + req.params[0]))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));
const io = socketIO(http);

import Server from './app.server';

import Map from './src/common/Map';
import Timer from './src/common/Timer';
import FileSystem = require("fs");




declare var global: any;
declare var map: any;
declare var time: Timer;
declare var server: Server;


global.map = new Map();
map.parseMap(JSON.parse(FileSystem.readFileSync("./map.json").toString()));

global.time = new Timer();

global.server = new Server(io);



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
