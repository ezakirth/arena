"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = function (num, min, max) { return Math.min(Math.max(num, min), max); };
var Client_serverside_1 = require("./Game/Client.serverside");
var Server = /** @class */ (function () {
    function Server(io) {
        this.io = io;
        this.clients = {};
        this.teams = { blue: [], green: [] };
        this.history = {};
    }
    Server.prototype.createClient = function (socket) {
        var clientId = socket.id;
        var team = (this.teams.blue.length >= this.teams.green.length ? 'green' : 'blue');
        this.teams[team].push(clientId);
        var client = new Client_serverside_1.default('clientname', clientId, team, map.assignSpawnToClient(team));
        this.clients[clientId] = client;
        socket.emit('init', { client: client, map: map.data });
    };
    Server.prototype.deleteClient = function (socket) {
        var clientId = socket.id;
        delete this.teams[this.clients[clientId].infos.team][clientId];
        delete this.clients[clientId];
        this.io.emit('disconnected', clientId);
    };
    Server.prototype.updateClient = function (socket, movementData) {
        var clientId = socket.id;
        var client = this.clients[clientId];
        if (!client.networkData.forceNoReconciliation) {
            client.position.x += movementData.movement.x;
            client.position.y += movementData.movement.y;
            client.direction.x += movementData.movement.dx;
            client.direction.y += movementData.movement.dy;
            client.networkData.sequence = movementData.sequence;
            var px = exports.clamp(Math.floor(client.position.x), 0, map.w - 1);
            var py = exports.clamp(Math.floor(client.position.y), 0, map.h - 1);
            if (!map.data[px][py].solid)
                client.lastGoodPos = { x: client.position.x, y: client.position.y };
            else {
                client.position = { x: client.lastGoodPos.x, y: client.lastGoodPos.y };
            }
            client.checkTile(map.data[px][py], px, py);
        }
    };
    Server.prototype.notifyClients = function () {
        var timestamp = +new Date();
        this.history[timestamp] = JSON.parse(JSON.stringify(this.clients));
        var list = Object.keys(this.history);
        if (list.length > 10) {
            delete this.history[list[0]];
        }
        this.io.emit('update', { timestamp: timestamp, clients: this.clients, mapUpdates: map.updates });
        map.processUpdates();
        for (var clientId in this.clients) {
            this.clients[clientId].networkData.forceNoReconciliation = false;
        }
    };
    return Server;
}());
exports.default = Server;
