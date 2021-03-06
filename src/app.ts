import express = require('express');
import socketIO = require('socket.io');
import path = require('path');
const PORT = process.env.PORT || 3000;

const root = path.resolve(__dirname, '..');

const INDEX = path.join(__dirname, '/index.html');
const http = express()
    .use(express.static('/*'))
    .get('/', function (req, res) {
        if (typeof (req.query.admin) == 'string')
            return res.sendFile(__dirname + '/admin.html');
        if (typeof (req.query.editor) == 'string')
            return res.sendFile(__dirname + '/editor.html');
        else
            return res.sendFile(INDEX);
    }).get('/*', (req, res, next) => res.sendFile(__dirname + '/' + req.params[0]))
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

server.loadMaps(__dirname + '/maps/');


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

    // editor stuff
    socket.on('saveMap', function (mapData) {
        let filename = (mapData.gameType + '_' + mapData.name).replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.json';

        FileSystem.writeFileSync(__dirname + '/maps/' + filename, JSON.stringify(mapData));
    });
    socket.on('loadMaps', function () {
        server.loadMaps(__dirname + '/maps/');
        socket.emit('loadMaps', server.mapsInfo);
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
