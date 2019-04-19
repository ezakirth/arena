export const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);
import Map from '../Map/Map';
import Timer from '../common/Timer';
import Projectile from '../Main/Projectile';
import ClientServer from '../Client/Client.server';
import Lobby from './Lobby';
import Vector from '../common/Vector';
import FileSystem = require("fs");
import MovementData from '../Client/MovementData';
import UUIDV1 = require('uuid/v1');

import Broadcast from './Broacast';


declare var time: Timer;

export default class Server {
    io: SocketIO.Server;
    lobbies: { [name: string]: Lobby };

    mapsInfo: any[];
    mapsInfoForClients: any[];

    constructor(io: SocketIO.Server) {
        this.io = io;

        this.lobbies = {};

        this.mapsInfo = [];
        this.mapsInfoForClients = [];
    }

    welcome(socket: SocketIO.Socket) {
        let lobbies = [];
        for (let lobbyId in this.lobbies) {
            let lobby = this.lobbies[lobbyId];

            lobbies.push({ id: lobby.id, mapId: lobby.mapId, map: lobby.map.name, gameType: lobby.map.gameType, current: Object.keys(lobby.clients).length, max: lobby.map.maxPlayers });

        }

        socket.emit('welcome', { clientId: socket.id, lobbies: lobbies, mapList: this.mapsInfoForClients });
    }

    /**
     * Called when client wants to join a lobby
     * @param socket
     * @param clientData (clientId, name, lobbyId)
     */
    createClient(socket: SocketIO.Socket, clientData: any) {
        let lobby = this.lobbies[clientData.lobbyId];
        if (!lobby) {
            let mapId = clientData.mapId;

            for (let mapInfo of this.mapsInfo) {
                if (mapInfo.id == mapId) {
                    let map = new Map().parseMap(JSON.parse(FileSystem.readFileSync(mapInfo.path).toString()))
                    lobby = new Lobby(map, mapInfo.id);
                    break;
                }
            }

            this.lobbies[lobby.id] = lobby;
        }
        socket.join(lobby.id);

        let team = (lobby.teams.blue.length >= lobby.teams.green.length ? 'green' : 'blue');
        lobby.teams[team].push(clientData.clientId);

        let client = new ClientServer(clientData.name, lobby.id, clientData.clientId, team, lobby.map.assignSpawnToClient(team));
        lobby.clients[clientData.clientId] = client;

        let data = {
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
    }


    deleteClient(socket: SocketIO.Socket) {
        let clientId = socket.id;

        let lobbyId = null;
        for (let clientLobbyId in this.lobbies) {
            let lobby = this.lobbies[clientLobbyId];
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
    }

    updateClient(socket: SocketIO.Socket, movementData: MovementData) {
        let lobby = this.lobbies[movementData.lobbyId];
        if (lobby) {
            let client = lobby.clients[socket.id];

            if (client) {

                client.position.x += movementData.deltaPosition.x;
                client.position.y += movementData.deltaPosition.y;
                client.direction.x += movementData.deltaDirection.x;
                client.direction.y += movementData.deltaDirection.y;

                let px = clamp(Math.floor(client.position.x), 0, lobby.map.width - 1);
                let py = clamp(Math.floor(client.position.y), 0, lobby.map.height - 1);

                let flagAction = client.checkTile(lobby.map.data[px][py], px, py);
                if (flagAction)
                    lobby.broadcast.addFlagAction({ name: client.name, team: client.infos.team, action: flagAction });

                client.networkData.sequence = movementData.sequence;
            }

        }
    }

    updateClients() {
        for (let lobbyId in this.lobbies) {
            let lobby = this.lobbies[lobbyId];

            let timestamp = +new Date();
            lobby.history[timestamp] = JSON.parse(JSON.stringify(lobby.clients));
            let list = Object.keys(lobby.history);
            if (list.length > 20) {
                delete lobby.history[list[0]];
            }

            this.io.to(lobbyId).emit('updateClients', { timestamp: timestamp, clients: lobby.clients, mapUpdates: lobby.map.updates, broadcast: lobby.broadcast.extract() });

            for (let clientId in lobby.clients) {
                lobby.clients[clientId].infos.spawned = true;
            }

            lobby.broadcast.reset();
            lobby.map.processUpdates();
        }

    }

    shootProjectile(projectile: Projectile) {
        let lobby = this.lobbies[projectile.lobbyId];
        if (lobby) {
            let newBullet = new Projectile(projectile.lobbyId, projectile.clientId, projectile.targetTeam, projectile.position, projectile.direction, projectile.type);
            lobby.newBullets.push(newBullet);
            lobby.projectiles.push(newBullet);
        }
    }

    /**
     * Look in lobby history to check if there was indeed a hit
     * @param projectileData
     */
    hitCheckProjectile(projectileData: any) {
        let timestamp = projectileData.timestamp;
        let projectile: Projectile = projectileData.projectile;
        let targetClientId = projectileData.targetClientId;

        let lobby = this.lobbies[projectile.lobbyId];
        let history = lobby.history[timestamp];


        if (history) {
            let clientHistory = history[targetClientId];

            if (clientHistory) {
                let clientPresent = lobby.clients[targetClientId];

                // @todo prendre en compte l'interpolation côté serveur !!!!
                if (clientPresent && !clientPresent.infos.dead && Vector._dist(projectile.position, clientHistory.position) < 1.5) {
                    let hasFlag = clientPresent.infos.hasEnemyFlag;
                    clientPresent.modLife(-projectile.type.dmg);

                    if (clientPresent.infos.dead) {
                        // tell everyone in lobby someone died
                        let killer = lobby.clients[projectile.clientId];
                        killer.infos.score.kills++;
                        lobby.broadcast.addCombat({ name: killer.name, team: killer.infos.team, killed: clientPresent.name, killedTeam: clientPresent.infos.team, weapon: projectile.type.name });

                        // if he had the flag, tell everyone !
                        if (hasFlag)
                            lobby.broadcast.addFlagAction({ name: clientPresent.name, team: clientPresent.infos.team, action: 'dropped' });
                    }
                }
            }
        }
    }

    update() {
        time.update();

        this.updateProjectiles();

        for (let lobbyId in this.lobbies) {
            let lobby = this.lobbies[lobbyId];
            for (let clientId in lobby.clients) {
                let client: ClientServer = lobby.clients[clientId];
                client.update();
            }
        }
    }

    updateProjectiles() {
        for (let lobbyId in this.lobbies) {
            let lobby = this.lobbies[lobbyId];
            // if there are new projectiles, send them to the clients
            if (lobby.newBullets.length > 0) {
                this.io.to(lobbyId).emit('updateProjectiles', lobby.newBullets);
                lobby.newBullets = [];
            }

            // update all projectiles
            for (let index = lobby.projectiles.length - 1; index >= 0; index--) {
                let projectile = lobby.projectiles[index];
                if (projectile.active) {
                    projectile.update();

                    // if one hits a client or a wall, remove it
                    for (let clientId in lobby.clients) {
                        let client = lobby.clients[clientId];
                        if (projectile.hitTest(client, true)) break;
                    }

                } else {
                    lobby.projectiles.splice(index, 1);
                }
            }
        }
    }

    loadMaps(path: string) {
        this.mapsInfo = [];
        this.mapsInfoForClients = [];

        FileSystem.readdirSync(path).forEach(file => {
            let mapPath = path + file;
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

            this.mapsInfo.push(mapInfo);
            this.mapsInfoForClients.push(mapInfoForClients);
        });
    }
}
