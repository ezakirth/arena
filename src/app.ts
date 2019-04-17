import express = require('express');
import socketIO = require('socket.io');
import path = require('path');
import UUIDV1 = require('uuid/v1');
const PORT = process.env.PORT || 3000;

const root = path.resolve(__dirname, '..');

const INDEX = path.join(__dirname, '/index.html');
const http = express()
    .use(express.static('/*'))
    .get('/', (req, res) => res.sendFile(INDEX))
    .get('/*', (req, res, next) => res.sendFile(__dirname + '/' + req.params[0]))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));
const io = socketIO(http);

import Server from './scripts/server/Server';

import Map from './scripts/Map/Map';
import Pickups from './scripts/Pickups/Pickups';
import Timer from './scripts/common/Timer';
import FileSystem = require("fs");
import Projectile from './scripts/Main/Projectile';
import MovementData from './scripts/Client/MovementData';


declare var global: any;
declare var server: Server;


global.pickups = new Pickups();
global.time = new Timer();
global.server = new Server(io);

FileSystem.readdirSync(__dirname + '/maps/').forEach(file => {
    let mapPath = __dirname + '/maps/' + file;
    let map = new Map().parseMap(JSON.parse(FileSystem.readFileSync(mapPath).toString()));

    let mapInfo = {
        id: UUIDV1(),
        name: map.name,
        gameType: map.gameType,
        maxPlayers: map.maxPlayers,
        width: map.width,
        height: map.height,
        mapData: map.data,
        path: mapPath
    }

    let mapInfoForClients = {
        id: mapInfo.id,
        name: mapInfo.name,
        gameType: mapInfo.gameType,
        maxPlayers: mapInfo.maxPlayers
    }

    server.mapsInfo.push(mapInfo);
    server.mapsInfoForClients.push(mapInfoForClients);
});

io.on('connection', function (socket: SocketIO.Socket) {
    server.welcome(socket);

    let fakeLag = false;
    let lagValue = Math.floor(300 + 20 * Math.random());

    socket.on('askToJoin', function (clientData: any) {
        server.createClient(socket, clientData);
    });

    socket.on('shoot', function (projectile: Projectile) {
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

    socket.on('hitCheckAuthored', function (projectileData) {
        if (fakeLag) {
            setTimeout(function () {
                server.hitCheckAuthoredProjectile(projectileData);
            }, lagValue);
        }
        else {
            server.hitCheckAuthoredProjectile(projectileData);
        }
    });

    socket.on('update', function (movementData: MovementData) {
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

});


setInterval(function () {
    server.update();
}, 1000 / 60);



setInterval(function () {
    server.updateClients();
}, 100);
