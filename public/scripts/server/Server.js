"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = function (num, min, max) { return Math.min(Math.max(num, min), max); };
var Map_1 = require("../Map/Map");
var Projectile_1 = require("../Main/Projectile");
var Client_server_1 = require("../Client/Client.server");
var Lobby_1 = require("./Lobby");
var Vector_1 = require("../common/Vector");
var FileSystem = require("fs");
var Server = /** @class */ (function () {
    function Server(io) {
        this.io = io;
        this.lobbies = {};
        this.mapsInfo = [];
        this.mapsInfoForClients = [];
    }
    Server.prototype.welcome = function (socket) {
        var lobbies = [];
        for (var lobbyId in this.lobbies) {
            var lobby = this.lobbies[lobbyId];
            lobbies.push({ id: lobby.id, mapId: lobby.mapId, map: lobby.map.name, gameType: lobby.map.gameType, current: Object.keys(lobby.clients).length, max: lobby.map.maxPlayers });
        }
        socket.emit('welcome', { clientId: socket.id, lobbies: lobbies, mapList: this.mapsInfoForClients });
    };
    /**
     * Called when client wants to join a lobby
     * @param socket
     * @param clientData (clientId, name, lobbyId)
     */
    Server.prototype.createClient = function (socket, clientData) {
        var lobby = this.lobbies[clientData.lobbyId];
        if (!lobby) {
            var mapId = clientData.mapId;
            for (var _i = 0, _a = this.mapsInfo; _i < _a.length; _i++) {
                var mapInfo = _a[_i];
                if (mapInfo.id == mapId) {
                    var map = new Map_1.default().parseMap(JSON.parse(FileSystem.readFileSync(mapInfo.path).toString()));
                    lobby = new Lobby_1.default(map, mapInfo.id);
                    break;
                }
            }
            this.lobbies[lobby.id] = lobby;
        }
        socket.join(lobby.id);
        var team = (lobby.teams.blue.length >= lobby.teams.green.length ? 'green' : 'blue');
        lobby.teams[team].push(clientData.clientId);
        var client = new Client_server_1.default(clientData.name, lobby.id, clientData.clientId, team, lobby.map.assignSpawnToClient(team));
        lobby.clients[clientData.clientId] = client;
        var data = {
            name: lobby.map.name,
            gameType: lobby.map.gameType,
            maxPlayers: lobby.map.maxPlayers,
            mapData: lobby.map.data,
            width: lobby.map.width,
            height: lobby.map.height
        };
        // tell everyone in lobby a new client joined
        lobby.broadcast.addJoined({ name: client.name, team: client.infos.team });
        socket.emit('acceptJoin', { client: client, mapInfo: data });
    };
    Server.prototype.deleteClient = function (socket) {
        var clientId = socket.id;
        var lobbyId = null;
        for (var clientLobbyId in this.lobbies) {
            var lobby = this.lobbies[clientLobbyId];
            if (lobby.clients[clientId]) {
                lobbyId = clientLobbyId;
                // tell everyone in lobby a client left
                lobby.broadcast.addLeft({ name: lobby.clients[clientId].name, team: lobby.clients[clientId].infos.team });
                delete lobby.teams[lobby.clients[clientId].infos.team][clientId];
                delete lobby.clients[clientId];
                socket.leave(lobbyId);
                break;
            }
        }
        if (lobbyId && Object.keys(this.lobbies[lobbyId].clients).length == 0) {
            delete this.lobbies[lobbyId];
        }
        this.io.to(lobbyId).emit('deleteClient', clientId);
    };
    Server.prototype.updateClient = function (socket, movementData) {
        var lobby = this.lobbies[movementData.lobbyId];
        if (lobby) {
            var client = lobby.clients[socket.id];
            if (client) {
                if (movementData.appliedAuthoring)
                    client.networkData.forceAuthoring = false;
                if (!client.networkData.forceAuthoring) {
                    client.position.x += movementData.deltaPosition.x;
                    client.position.y += movementData.deltaPosition.y;
                    client.direction.x += movementData.deltaDirection.x;
                    client.direction.y += movementData.deltaDirection.y;
                    var px = exports.clamp(Math.floor(client.position.x), 0, lobby.map.width - 1);
                    var py = exports.clamp(Math.floor(client.position.y), 0, lobby.map.height - 1);
                    if (!lobby.map.data[px][py].solid)
                        client.lastGoodPos = new Vector_1.default(client.position.x, client.position.y);
                    else {
                        client.position = new Vector_1.default(client.lastGoodPos.x, client.lastGoodPos.y);
                        client.networkData.forceAuthoring = true;
                    }
                    var flagAction = client.checkTile(lobby.map.data[px][py], px, py);
                    //             client.checkPortal(lobby.map.data[px][py]);
                    if (flagAction)
                        lobby.broadcast.addFlagAction({ name: client.name, team: client.infos.team, action: flagAction });
                }
                client.networkData.sequence = movementData.sequence;
            }
        }
    };
    Server.prototype.updateClients = function () {
        for (var lobbyId in this.lobbies) {
            var lobby = this.lobbies[lobbyId];
            var timestamp = +new Date();
            lobby.history[timestamp] = JSON.parse(JSON.stringify(lobby.clients));
            var list = Object.keys(lobby.history);
            if (list.length > 20) {
                delete lobby.history[list[0]];
            }
            this.io.to(lobbyId).emit('updateClients', { timestamp: timestamp, clients: lobby.clients, mapUpdates: lobby.map.updates, broadcast: lobby.broadcast.extract() });
            for (var clientId in lobby.clients) {
                lobby.clients[clientId].infos.spawned = true;
            }
            lobby.broadcast.reset();
            lobby.map.processUpdates();
        }
    };
    Server.prototype.shootProjectile = function (projectile) {
        var lobby = this.lobbies[projectile.lobbyId];
        if (lobby) {
            var newBullet = new Projectile_1.default(projectile.lobbyId, projectile.clientId, projectile.targetTeam, projectile.position, projectile.direction, projectile.type);
            lobby.newBullets.push(newBullet);
            lobby.projectiles.push(newBullet);
        }
    };
    /**
     * Look in lobby history to check if there was indeed a hit
     * @param projectileData
     */
    Server.prototype.hitCheckAuthoredProjectile = function (projectileData) {
        var timestamp = projectileData.timestamp;
        var projectile = projectileData.projectile;
        var targetClientId = projectileData.targetClientId;
        var lobby = this.lobbies[projectile.lobbyId];
        var history = lobby.history[timestamp];
        if (history) {
            var clientHistory = history[targetClientId];
            if (clientHistory) {
                var clientPresent = lobby.clients[targetClientId];
                // @todo prendre en compte l'interpolation côté serveur !!!!
                if (clientPresent && !clientPresent.infos.dead && Vector_1.default._dist(projectile.position, clientHistory.position) < 1.5) {
                    var hasFlag = clientPresent.infos.hasEnemyFlag;
                    clientPresent.modLife(-projectile.type.dmg);
                    if (clientPresent.infos.dead) {
                        // tell everyone in lobby someone died
                        var killer = lobby.clients[projectile.clientId];
                        killer.infos.score.kills++;
                        lobby.broadcast.addCombat({ name: killer.name, team: killer.infos.team, killed: clientPresent.name, killedTeam: clientPresent.infos.team, weapon: projectile.type.name });
                        // if he had the flag, tell everyone !
                        if (hasFlag)
                            lobby.broadcast.addFlagAction({ name: clientPresent.name, team: clientPresent.infos.team, action: 'dropped' });
                    }
                }
            }
        }
    };
    /**
     * Look in lobby history to check if there was indeed a hit
     * @param projectileData
     */
    Server.prototype.hitCheckProjectile = function (projectileData) {
        var projectile = projectileData.projectile;
        var targetClientId = projectileData.targetClientId;
        var lobby = this.lobbies[projectile.lobbyId];
        if (lobby) {
            var clientPresent = lobby.clients[targetClientId];
            if (clientPresent && !clientPresent.infos.dead) {
                var hasFlag = clientPresent.infos.hasEnemyFlag;
                clientPresent.modLife(-projectile.type.dmg);
                if (clientPresent.infos.dead) {
                    // tell everyone in lobby someone died
                    var killer = lobby.clients[projectile.clientId];
                    killer.infos.score.kills++;
                    lobby.broadcast.addCombat({ name: killer.name, team: killer.infos.team, killed: clientPresent.name, killedTeam: clientPresent.infos.team, weapon: projectile.type.name });
                    // if he had the flag, tell everyone !
                    if (hasFlag)
                        lobby.broadcast.addFlagAction({ name: clientPresent.name, team: clientPresent.infos.team, action: 'dropped' });
                }
            }
        }
    };
    Server.prototype.update = function () {
        time.update();
        this.updateProjectiles();
        for (var lobbyId in this.lobbies) {
            var lobby = this.lobbies[lobbyId];
            for (var clientId in lobby.clients) {
                var client = lobby.clients[clientId];
                client.update();
            }
        }
    };
    Server.prototype.updateProjectiles = function () {
        for (var lobbyId in this.lobbies) {
            var lobby = this.lobbies[lobbyId];
            // if there are new projectiles, send them to the clients
            if (lobby.newBullets.length > 0) {
                this.io.to(lobbyId).emit('updateProjectiles', lobby.newBullets);
                lobby.newBullets = [];
            }
            // update all projectiles
            for (var index = lobby.projectiles.length - 1; index >= 0; index--) {
                var projectile = lobby.projectiles[index];
                if (projectile.active) {
                    projectile.update();
                    // if one hits a client or a wall, remove it
                    for (var clientId in lobby.clients) {
                        var client = lobby.clients[clientId];
                        if (projectile.hitTest(client, true))
                            break;
                    }
                }
                else {
                    lobby.projectiles.splice(index, 1);
                }
            }
        }
    };
    return Server;
}());
exports.default = Server;
