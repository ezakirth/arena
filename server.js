const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
const server = express()
  .use(express.static('/*'))
  .get('/', (req, res) => res.sendFile(INDEX))
  .get('/*', (req, res, next) => res.sendFile(__dirname + '/' + req.params[0]))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
const io = socketIO(server);

const Client = require('./js/Game/Client');
const Map = require('./js/common/Map');
const Timer = require('./js/common/Timer');
const fs = require("fs");

Number.prototype.clamp = function (min, max) {
  return Math.min(Math.max(this, min), max);
};

var clients = {};
var history = {};


global.map = new Map();
global.time = new Timer();

map.parseMap(JSON.parse(fs.readFileSync("map.json")));


io.on('connection', function (socket) {
  let client = new Client('clientname', socket.id);
  clients[client.networkData.clientId] = client;
  socket.emit('init', { client: client, map: map.data });

  socket.on('update', function (movementData) {
    let client = clients[socket.id];
    if (!client.networkData.forceNoReconciliation) {
      client.position.x += movementData.movement.x;
      client.position.y += movementData.movement.y;
      client.direction.x += movementData.movement.dx;
      client.direction.y += movementData.movement.dy;
      client.networkData.sequence = movementData.sequence;

      let px = Math.floor(client.position.x).clamp(0, map.w - 1);
      let py = Math.floor(client.position.y).clamp(0, map.h - 1);

      if (!map.data[px][py].solid) client.lastGoodPos = { x: client.position.x, y: client.position.y };
      else { client.position = { x: client.lastGoodPos.x, y: client.lastGoodPos.y }; }
      client.checkTile(map.data[px][py], px, py);
    }

  });

  socket.on('disconnect', function () {
    io.emit('disconnected', socket.id);
    let team = map.teams[clients[socket.id].infos.team];
    for (let index = 0; index < team.length; index++) {
      if (team[index].clientId = socket.id) {
        team.splice(index, 1);
        break;
      }
    }
    delete clients[socket.id];
  });

  socket.on('pingtest', function () {
    socket.emit('pongtest');
  });

});


setInterval(function () {
  let timestamp = +new Date();
  history[timestamp] = JSON.parse(JSON.stringify(clients));
  let list = Object.keys(history);
  if (list.length > 10) {
    delete history[list[0]];
  }

  time.update();

  io.emit('update', { timestamp: timestamp, clients: clients, mapUpdates: map.updates });
  map.processUpdates();

  for (let clientId in clients) {
    clients[clientId].networkData.forceNoReconciliation = false;
  }

}, 100);
