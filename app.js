const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
const http = express()
  .use(express.static('/*'))
  .get('/', (req, res) => res.sendFile(INDEX))
  .get('/*', (req, res, next) => res.sendFile(__dirname + '/' + req.params[0]))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
const io = socketIO(http);

const Server = require('./Server');

const Map = require('./js/common/Map');
const Timer = require('./js/common/Timer');
const FileSystem = require("fs");

Number.prototype.clamp = function (min, max) {
  return Math.min(Math.max(this, min), max);
};



global.map = new Map();
map.parseMap(JSON.parse(FileSystem.readFileSync("map.json")));

global.time = new Timer();

server = new Server(io);



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
