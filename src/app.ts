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

import Server from './server/Server';

import Map from './Map/Map';
import Pickups from './Pickups/Pickups';
import Timer from './common/Timer';
import FileSystem = require("fs");
import Projectile from './Main/Projectile';
import MovementData from './types/MovementData';




declare var global: any;
declare var server: Server;


global.pickups = new Pickups();
global.time = new Timer();
global.server = new Server(io);

FileSystem.readdirSync(root + '/maps/').forEach(file => {
    let mapPath = root + '/maps/' + file;
    let map = new Map().parseMap(JSON.parse(FileSystem.readFileSync(mapPath).toString()));

    let mapInfo = {
        name: map.name,
        gameType: map.gameType,
        maxPlayers: map.maxPlayers,
        width: map.width,
        height: map.height,
        mapData: map.data,
        path: mapPath
    }

    server.maps.push(mapInfo);
});

io.on('connection', function (socket: SocketIO.Socket) {
    server.welcome(socket);

    socket.on('join', function (clientData: any) {
        server.createClient(socket, clientData);
    });

    socket.on('shoot', function (projectile: Projectile) {
        server.shootBullet(projectile);
    });

    socket.on('update', function (movementData: MovementData) {
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
