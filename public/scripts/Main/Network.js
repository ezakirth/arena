"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import * as io from '/socket.io/socket.io.js';
var io = require("socket.io-client");
var Client_local_1 = require("../Client/Client.local");
var Projectile_1 = require("./Projectile");
var Vector_1 = require("../common/Vector");
var MovementData_1 = require("../Client/MovementData");
var PositionBuffer_1 = require("../Client/PositionBuffer");
var Network = /** @class */ (function () {
    function Network() {
    }
    Network.prototype.constuctor = function () {
        this.latency = 0;
        this.lastServerTimestamp = 0;
        this.socket = null;
    };
    Network.prototype.init = function () {
        this.socket = io(); //'http://localhost:3000');
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
            var client = main.clients[main.localClientId];
            if (client) {
                _this.sendMovementData(client);
            }
        }, 100);
        /**
         * Connected to the server
         * serverData : clientId, lobbies, mapList
         */
        this.socket.on('init', function (serverData) {
            main.localClientId = serverData.clientId;
            main.lobbies = serverData.lobbies;
            main.mapList = serverData.mapList;
            main.menu.show();
        });
        this.socket.on('create', function (serverData) {
            _this.createClient(serverData);
            loop();
        });
        // disconnected to the server
        this.socket.on('disconnected', function (clientId) {
            _this.deleteClient(clientId);
        });
        // updates from the server
        this.socket.on('update', function (serverData) {
            _this.updateClient(serverData);
        });
        // projectile updates from the server
        this.socket.on('projectiles', function (projectiles) {
            _this.updateBullets(projectiles);
        });
    };
    Network.prototype.joinGame = function (mapPath) {
        this.socket.emit('join', { clientId: main.localClientId, name: main.localClientName, lobbyId: main.lobbyId, mapPath: mapPath });
    };
    /**
     * Load map from server and add local client
     * @param {*} serverData
     */
    Network.prototype.createClient = function (serverData) {
        var client = serverData.client;
        var mapInfo = serverData.mapInfo;
        map.parseMap(mapInfo);
        main.localClient = main.clients[main.localClientId] = new Client_local_1.default(client.name, client.networkData.lobbyId, client.networkData.clientId, client.infos.team, client.position);
    };
    Network.prototype.deleteClient = function (clientId) {
        delete main.clients[clientId];
    };
    Network.prototype.updateClient = function (serverData) {
        this.lastServerTimestamp = serverData.timestamp;
        map.updates = serverData.mapUpdates || [];
        map.processUpdates();
        var serverClients = serverData.clients;
        for (var clientId in serverClients) {
            var serverClient = serverClients[clientId];
            // if client doesn't exist locally, create it
            if (!main.clients[clientId]) {
                main.clients[clientId] = new Client_local_1.default(serverClient.name, serverClient.networkData.lobbyId, serverClient.networkData.clientId, serverClient.infos.team, serverClient.position);
            }
            var client = main.clients[clientId];
            if (clientId == main.localClientId) {
                // server tells us to ignore our movement, so we just apply authoring, no reconciliation
                if (serverClient.networkData.ignoreClientMovement) {
                    client.networkData.reconciliationMovement = [];
                    this.authoring(client, serverClient);
                    client.savePositionForReconciliation();
                    // we let server know we applied authoring asap
                    this.socket.emit('update', new MovementData_1.default(new Vector_1.default(0, 0), new Vector_1.default(0, 0), ++client.networkData.sequence, true, client.networkData.lobbyId));
                }
                else {
                    // if there was movement since the last server update, send it now
                    this.sendMovementData(client);
                    // apply authoring and reconciliation
                    this.authoring(client, serverClient);
                    this.reconciliation(client, serverClient);
                }
            }
            else {
                client.infos.apply(serverClient.infos);
                this.clientsPositionBuffer(client, serverClient);
            }
        }
    };
    /**
     * Apply the authoritative position of this client's client.
     * @param {ClientLocal} client
     * @param {ClientServer} serverClient
     */
    Network.prototype.authoring = function (client, serverClient) {
        client.position.set(serverClient.position.x, serverClient.position.y);
        client.direction.set(serverClient.direction.x, serverClient.direction.y);
        client.infos.apply(serverClient.infos);
    };
    /**
     * Server Reconciliation. Re-apply all the inputs not yet processed by the server.
     * @param {ClientLocal} client
     * @param {ClientServer} serverClient
     */
    Network.prototype.reconciliation = function (client, serverClient) {
        var j = 0;
        while (j < client.networkData.reconciliationMovement.length) {
            var movementData = client.networkData.reconciliationMovement[j];
            if (movementData.sequence <= serverClient.networkData.sequence) {
                // Already processed. Its effect is already taken into account into the world update
                // we just got, so we can drop it.
                client.networkData.reconciliationMovement.splice(j, 1);
            }
            else {
                client.position.add(movementData.deltaPosition);
                client.direction.add(movementData.deltaDirection);
                j++;
            }
        }
    };
    /**
     * Add the position of non local clients to the position buffer.
     * @param {ClientLocal} client
     * @param {ClientServer} serverClient
     */
    Network.prototype.clientsPositionBuffer = function (client, serverClient) {
        var timestamp = +new Date();
        time.setServerDelay(timestamp);
        // if client was forced to a position by server, we don't want to interpolate (after using a portal for example)
        if (serverClient.networkData.ignoreClientMovement) {
            client.networkData.positionBuffer = [];
            client.networkData.positionBuffer.push(new PositionBuffer_1.default(timestamp - 1, serverClient.position, serverClient.direction));
            client.position.set(serverClient.position.x, serverClient.position.y);
            client.direction.set(serverClient.direction.x, serverClient.direction.y);
        }
        else
            client.networkData.positionBuffer.push(new PositionBuffer_1.default(timestamp, serverClient.position, serverClient.direction));
    };
    Network.prototype.sendMovementData = function (client) {
        // get movement since last one sent to server
        var deltaPosition = new Vector_1.default(client.position.x - client.networkData.lastPosition.x, client.position.y - client.networkData.lastPosition.y);
        var deltaDirection = new Vector_1.default(client.direction.x - client.networkData.lastDirection.x, client.direction.y - client.networkData.lastDirection.y);
        // If there was movement, notify the server
        if (Math.abs(deltaPosition.x) + Math.abs(deltaPosition.y) + Math.abs(deltaDirection.x) + Math.abs(deltaDirection.y) > 0) {
            client.savePositionForReconciliation();
            // send movement to server for validation
            var movementData = new MovementData_1.default(deltaPosition, deltaDirection, ++client.networkData.sequence, false, client.networkData.lobbyId);
            this.socket.emit('update', movementData);
            // store movements for later reconciliation
            client.networkData.reconciliationMovement.push(movementData);
        }
    };
    /**
     * Shoots a projectile (origin = local)
     * @param client
     */
    Network.prototype.shootWeapon = function (client) {
        var projectile = null;
        if (client.infos.weapon.name == "shotgun") {
            // random projectiles that won't be pushed to server
            for (var i = 0; i < 8; i++) {
                var ang = (-15 + Math.random() * 30) * Math.PI / 180;
                projectile = new Projectile_1.default(client.networkData.lobbyId, client.networkData.clientId, (map.gameType == 'Deathmatch' ? 'any' : client.infos.enemyTeam), client.position, Vector_1.default._rotate(client.direction, ang), client.infos.weapon);
                main.projectiles.push(projectile);
            }
            projectile = new Projectile_1.default(client.networkData.lobbyId, client.networkData.clientId, (map.gameType == 'Deathmatch' ? 'any' : client.infos.enemyTeam), client.position, client.direction, client.infos.weapon);
            main.projectiles.push(projectile);
        }
        else {
            var ang = 0;
            if (client.infos.weapon.name == "blastgun")
                ang = (-5 + Math.random() * 10) * Math.PI / 180;
            projectile = new Projectile_1.default(client.networkData.lobbyId, client.networkData.clientId, (map.gameType == 'Deathmatch' ? 'any' : client.infos.enemyTeam), client.position, Vector_1.default._rotate(client.direction, ang), client.infos.weapon);
            main.projectiles.push(projectile);
        }
        this.socket.emit('shoot', projectile);
    };
    /**
     * Adds a projectile (origin = server)
     * @param projectiles
     */
    Network.prototype.updateBullets = function (projectiles) {
        for (var _i = 0, projectiles_1 = projectiles; _i < projectiles_1.length; _i++) {
            var projectile = projectiles_1[_i];
            if (projectile.clientId != main.localClientId) {
                var newBullet = new Projectile_1.default(projectile.lobbyId, projectile.clientId, projectile.targetTeam, projectile.position, projectile.direction, projectile.type);
                main.projectiles.push(newBullet);
                if (projectile.type.name == "shotgun") {
                    // random projectiles that won't be pushed to server
                    for (var i = 0; i < 8; i++) {
                        var ang = (-15 + Math.random() * 30) * Math.PI / 180;
                        newBullet = new Projectile_1.default(projectile.lobbyId, projectile.clientId, projectile.targetTeam, projectile.position, Vector_1.default._rotate(projectile.direction, ang), projectile.type);
                        main.projectiles.push(newBullet);
                    }
                }
            }
        }
    };
    return Network;
}());
exports.default = Network;
//var socket = io('https://charpie.herokuapp.com/');
