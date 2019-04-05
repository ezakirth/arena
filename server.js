class Client {
  constructor(clientId) {
    this.networkData = {
      clientId: clientId,
      sequence: 0
    };

    this.infos = {
      team: map.assignClientToTeam(this)
    };
    this.position = map.assignSpawnToClient(this.infos.team);
    this.direction = { x: 1, y: 0 };
  }
}

class Map {
  constructor(data) {
    this.data = data;
    this.w = this.data.length;
    this.h = this.data[0].length;
    this.teams = { blue: [], green: [] };
    this.spawns = { blue: [], green: [] };
    this.flags = { blue: null, green: null };

    for (let x = 0; x < this.w; x++) {
      for (let y = 0; y < this.h; y++) {
        let block = this.data[x][y];

        if (block.pickup == "pickup_flag_blue") {
          this.flags.blue = { x: x, y: y };
        }
        if (block.pickup == "pickup_flag_green") {
          this.flags.green = { x: x, y: y };
        }
        if (block.spawn == "spawn_blue") {
          this.spawns.blue.push({ x: x + 0.5, y: y + 0.5 });
        }
        if (block.spawn == "spawn_green") {
          this.spawns.green.push({ x: x + 0.5, y: y + 0.5 });
        }
      }
    };
  }
  /**
   * Assign the client to a team (keeping them evenly matched)
   * @param {object} client
   */
  assignClientToTeam(client) {
    if (this.teams.blue.length >= this.teams.green.length) {
      this.teams.green.push(client);
      return 'green';
    }
    else {
      this.teams.blue.push(client);
      return 'blue';
    }
  }

  /**
   * Pick a random spawn point to a client
   * @param {string} team
   */
  assignSpawnToClient(team) {
    let spawnPoint = this.spawns[team][Math.floor(Math.random() * this.spawns[team].length)];

    return { x: spawnPoint.x, y: spawnPoint.y };
  }
}

var clients = {};
var history = {};

var fs = require("fs");
/*
var Network = require('./js/Game/Network.js');
var network = new Network();
*/

var map = new Map(JSON.parse(fs.readFileSync("map.json")));

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

io.on('connection', function (socket) {
  let client = new Client(socket.id);
  clients[client.networkData.clientId] = client;
  socket.emit('init', { client: client, map: map.data });

  socket.on('update', function (movementData) {
    let client = clients[socket.id];
    client.position.x += movementData.movement.x;
    client.position.y += movementData.movement.y;
    client.direction.x += movementData.movement.dx;
    client.direction.y += movementData.movement.dy;
    client.networkData.sequence = movementData.sequence;
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

  io.emit('update', { timestamp: timestamp, clients: clients });
}, 100);
