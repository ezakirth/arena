"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import * as io from '/socket.io/socket.io.js';
var io = require("socket.io-client");
var Client_clientside_1 = require("./Client.clientside");
var Network = /** @class */ (function () {
    function Network() {
    }
    Network.prototype.constuctor = function () {
        this.latency = 0;
        this.lastServerTimestamp = 0;
        this.socket = null;
    };
    Network.prototype.init = function () {
        this.socket = io('http://localhost:3000');
        var _this = this;
        /*
        setInterval(function () {
            _this.startTime = Date.now();
            _this.socket.emit('pingtest');
        }, 2000);
        this.socket.on('pongtest', function () {
            _this.latency = Date.now() - _this.startTime;
             document.getElementById('ping').innerText = _this.latency + 'ms';
        });
        */
        setInterval(function () {
            var client = game.clients[game.localClientId];
            if (client) {
                _this.sendMovementData(client);
            }
        }, 100);
        // Connected to the server
        this.socket.on('init', function (serverData) {
            _this.createClient(serverData);
        });
        // disconnected to the server
        this.socket.on('disconnected', function (clientId) {
            _this.deleteClient(clientId);
        });
        // updates from the server
        this.socket.on('update', function (data) {
            _this.updateClient(data);
        });
    };
    /**
     * Load map from server and add local client
     * @param {*} serverData
     * @param {*} callback
     */
    Network.prototype.createClient = function (serverData) {
        var client = serverData.client;
        var mapData = serverData.map;
        map.parseMap(mapData);
        game.localClientId = client.networkData.clientId;
        game.localClient = game.clients[game.localClientId] = new Client_clientside_1.default('Local client', game.localClientId, client.infos.team, client.position);
    };
    Network.prototype.deleteClient = function (clientId) {
        delete game.clients[clientId];
    };
    Network.prototype.updateClient = function (data) {
        this.lastServerTimestamp = data.timestamp;
        map.updates = data.mapUpdates;
        map.processUpdates();
        var serverClients = data.clients;
        for (var clientId in serverClients) {
            var serverClient = serverClients[clientId];
            if (!game.clients[clientId]) {
                game.clients[clientId] = new Client_clientside_1.default('Network client ' + Object.keys(game.clients).length, serverClient.networkData.clientId, serverClient.infos.team, serverClient.position);
            }
            var client = game.clients[clientId];
            if (clientId == game.localClientId) {
                // if there was movement since the last server update, send it now
                if (serverClient.networkData.forceNoReconciliation)
                    client.networkData.pendingMovement = [];
                else
                    this.sendMovementData(client);
                this.authoring(client, serverClient);
                this.reconciliation(client, serverClient);
            }
            else {
                this.clientsPositionBuffer(client, serverClient);
            }
        }
    };
    /**
     * Apply the authoritative position of this client's client.
     * @param {*} client
     * @param {*} serverClient
     */
    Network.prototype.authoring = function (client, serverClient) {
        client.position.x = serverClient.position.x;
        client.position.y = serverClient.position.y;
        client.direction.x = serverClient.direction.x;
        client.direction.y = serverClient.direction.y;
        client.infos = serverClient.infos;
        client.infos.name = 'localza';
        if (serverClient.networkData.forceNoReconciliation) {
            client.networkData.lastPosition.x = client.position.x;
            client.networkData.lastPosition.y = client.position.y;
        }
    };
    /**
     * Server Reconciliation. Re-apply all the inputs not yet processed by the server.
     * @param {*} client
     * @param {*} serverClient
     */
    Network.prototype.reconciliation = function (client, serverClient) {
        var j = 0;
        while (j < client.networkData.pendingMovement.length) {
            var movementData = client.networkData.pendingMovement[j];
            if (movementData.sequence <= serverClient.networkData.sequence) {
                // Already processed. Its effect is already taken into account into the world update
                // we just got, so we can drop it.
                client.networkData.pendingMovement.splice(j, 1);
            }
            else {
                client.position.x += movementData.movement.x;
                client.position.y += movementData.movement.y;
                client.direction.x += movementData.movement.dx;
                client.direction.y += movementData.movement.dy;
                j++;
            }
        }
    };
    /**
     * Add the position of non local clients to the position buffer.
     * @param {*} client
     * @param {*} serverClient
     */
    Network.prototype.clientsPositionBuffer = function (client, serverClient) {
        var timestamp = +new Date();
        time.setServerDelay(timestamp);
        if (serverClient.networkData.forceNoReconciliation) {
            client.networkData.positionBuffer = [];
            client.networkData.positionBuffer.push({ timestamp: timestamp - 1, position: serverClient.position, direction: serverClient.direction });
            client.position.x = serverClient.position.x;
            client.position.y = serverClient.position.y;
        }
        else
            client.networkData.positionBuffer.push({ timestamp: timestamp, position: serverClient.position, direction: serverClient.direction });
    };
    Network.prototype.sendMovementData = function (client) {
        // get movement since last one sent to server
        var deltaPosition = {
            x: client.position.x - client.networkData.lastPosition.x,
            y: client.position.y - client.networkData.lastPosition.y,
            dx: client.direction.x - client.networkData.lastPosition.dx,
            dy: client.direction.y - client.networkData.lastPosition.dy,
        };
        // If there was movement, notify the server
        if (Math.abs(deltaPosition.x) + Math.abs(deltaPosition.y) + Math.abs(deltaPosition.dx) + Math.abs(deltaPosition.dy) > 0) {
            client.networkData.lastPosition = { x: client.position.x, y: client.position.y, dx: client.direction.x, dy: client.direction.y };
            // send movement to server for validation
            var movementData = { movement: deltaPosition, sequence: ++client.networkData.sequence };
            this.socket.emit('update', movementData);
            // store movements for later reconciliation
            client.networkData.pendingMovement.push(movementData);
        }
    };
    return Network;
}());
exports.default = Network;
//var socket = io('https://charpie.herokuapp.com/');
