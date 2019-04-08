import express = require('express');
import socketIO = require('socket.io');
import path = require('path');
const PORT = process.env.PORT || 3000;

const root = path.resolve(__dirname, '..');

const INDEX = path.join(root, './index.html');
const http = express()
    .use(express.static('/*'))
    .get('/', (req, res) => res.sendFile(INDEX))
    .get('/*', (req, res, next) => res.sendFile(root + '/' + req.params[0]))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));
const io = socketIO(http);

import Server from './Server';

import Map from './common/Map';
import Timer from './common/Timer';
import FileSystem = require("fs");




declare var global: any;
declare var map: any;
declare var time: Timer;
declare var server: Server;


global.map = new Map();
map.parseMap(JSON.parse(FileSystem.readFileSync(root + "/map.json").toString()));

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
