export const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);
import Map from '../Map/Map';
import Timer from '../common/Timer';
import Projectile from '../Main/Projectile';
import ClientServer from '../Client/Client.server';
import Lobby from './Lobby';
import Vector from '../common/Vector';
import FileSystem = require("fs");
import MovementData from '../Client/MovementData';

declare var time: Timer;

export default class Server {
    io: SocketIO.Server;
    lobbies: { [name: string]: Lobby };

    maps: any[];

    constructor(io: SocketIO.Server) {
        this.io = io;

        this.lobbies = {};

        this.maps = [];


    }

    welcome(socket) {
        let lobbies = [];
        for (let lobbyId in this.lobbies) {
            let lobby = this.lobbies[lobbyId];

            lobbies.push({ id: lobby.id, map: lobby.map.name, gameType: lobby.map.gameType, current: Object.keys(lobby.clients).length, max: lobby.map.maxPlayers });

        }
        socket.emit('init', { clientId: socket.id, lobbies: lobbies, mapList: this.maps });
    }

    /**
     * Called when client wants to join a lobby
     * @param socket
     * @param clientData (clientId, name, lobbyId)
     */
    createClient(socket: SocketIO.Socket, clientData) {
        //
        let lobby = this.lobbies[clientData.lobbyId];
        if (!lobby) {
            let mapPath = clientData.mapPath;
            let map = new Map().parseMap(JSON.parse(FileSystem.readFileSync(mapPath).toString()))
            lobby = new Lobby(map);
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

        socket.emit('create', { client: client, mapInfo: data });
    }


    deleteClient(socket: SocketIO.Socket) {
        let clientId = socket.id;

        let lobbyId = null;
        for (let clientLobbyId in this.lobbies) {
            let lobby = this.lobbies[clientLobbyId];
            if (lobby.clients[clientId]) {
                lobbyId = clientLobbyId;
                delete lobby.teams[lobby.clients[clientId].infos.team][clientId];
                delete lobby.clients[clientId];
                socket.leave(lobbyId);
                break;
            }
        }

        if (lobbyId && Object.keys(this.lobbies[lobbyId].clients).length == 0) {
            delete this.lobbies[lobbyId];
        }

        this.io.to(lobbyId).emit('disconnected', clientId);
    }

    updateClient(socket: SocketIO.Socket, movementData: MovementData) {
        let lobby = this.lobbies[movementData.lobbyId];
        if (lobby) {
            let client = lobby.clients[socket.id];

            if (!client.networkData.forceNoReconciliation) {
                client.position.x += movementData.deltaPosition.x;
                client.position.y += movementData.deltaPosition.y;
                client.direction.x += movementData.deltaDirection.x;
                client.direction.y += movementData.deltaDirection.y;
                client.networkData.sequence = movementData.sequence;

                let px = clamp(Math.floor(client.position.x), 0, lobby.map.width - 1);
                let py = clamp(Math.floor(client.position.y), 0, lobby.map.height - 1);

                if (!lobby.map.data[px][py].solid) client.lastGoodPos = new Vector(client.position.x, client.position.y);
                else { client.position = new Vector(client.lastGoodPos.x, client.lastGoodPos.y) }
                client.checkTile(lobby.map.data[px][py], px, py);
            }

        }
    }

    notifyClients() {
        for (let lobbyId in this.lobbies) {
            let lobby = this.lobbies[lobbyId];

            let timestamp = +new Date();
            lobby.history[timestamp] = JSON.parse(JSON.stringify(lobby.clients));
            let list = Object.keys(lobby.history);
            if (list.length > 10) {
                delete lobby.history[list[0]];
            }

            this.io.to(lobbyId).emit('update', { timestamp: timestamp, clients: lobby.clients, mapUpdates: lobby.map.updates });
            lobby.map.processUpdates();

            for (let clientId in lobby.clients) {
                lobby.clients[clientId].networkData.forceNoReconciliation = false;
            }
        }

    }



    shootBullet(projectile: Projectile) {
        let lobby = this.lobbies[projectile.lobbyId];

        let newBullet = new Projectile(projectile.lobbyId, projectile.clientId, projectile.targetTeam, projectile.position, projectile.direction, projectile.type);
        lobby.newBullets.push(newBullet);
        lobby.projectiles.push(newBullet);
    }




    update() {
        time.update();

        this.updateBullets();

        this.updateClients();

    }

    updateBullets() {
        for (let lobbyId in this.lobbies) {
            let lobby = this.lobbies[lobbyId];
            // if there are new projectiles, send them to the clients
            if (lobby.newBullets.length > 0) {
                this.io.to(lobbyId).emit('projectiles', lobby.newBullets);
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

    updateClients() {
        for (let lobbyId in this.lobbies) {
            let lobby = this.lobbies[lobbyId];
            for (let clientId in lobby.clients) {
                let client: ClientServer = lobby.clients[clientId];
                client.update();
            }
        }
    }
}
