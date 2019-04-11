export const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);
import Map from './common/Map';
import Timer from './common/Timer';
import Bullet from './Game/Bullet';
import Clientserverside from './Game/Client.serverside';
import Lobby from './Lobby';
import Vector from './common/Vector';
import FileSystem = require("fs");

declare var time: Timer;

export default class Server {
    io: SocketIO.Server;
    lobbies: { [name: string]: Lobby };

    maps: string[];

    constructor(io: SocketIO.Server) {
        this.io = io;

        this.lobbies = {};

        this.maps = [];


    }

    welcome(socket) {
        let lobbies = [];
        for (let lobbyId in this.lobbies) {
            let lobby = this.lobbies[lobbyId];
            lobbies.push({ id: lobby.id, map: lobby.map.name, type: lobby.map.type, current: Object.keys(lobby.clients).length, max: lobby.map.maxPlayers });

        }
        socket.emit('init', { clientId: socket.id, lobbies: lobbies });
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
            let mapPath = this.maps[0];
            let map = new Map().parseMap(JSON.parse(FileSystem.readFileSync(mapPath).toString()))
            lobby = new Lobby(map);
            this.lobbies[lobby.id] = lobby;
            socket.join(lobby.id);
        }

        let team = (lobby.teams.blue.length >= lobby.teams.green.length ? 'green' : 'blue');
        lobby.teams[team].push(clientData.clientId);

        let client = new Clientserverside(clientData.name, lobby.id, clientData.clientId, team, lobby.map.assignSpawnToClient(team));
        lobby.clients[clientData.clientId] = client;
        socket.emit('create', { client: client, map: lobby.map.data });
    }


    deleteClient(socket) {
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

    updateClient(socket, clientData) {
        let movementData = clientData;
        let lobby = this.lobbies[clientData.lobbyId];
        if (lobby) {
            let client = lobby.clients[socket.id];

            if (!client.networkData.forceNoReconciliation) {
                client.position.x += movementData.movement.x;
                client.position.y += movementData.movement.y;
                client.direction.x += movementData.movement.dx;
                client.direction.y += movementData.movement.dy;
                client.networkData.sequence = movementData.sequence;

                let px = clamp(Math.floor(client.position.x), 0, lobby.map.w - 1);
                let py = clamp(Math.floor(client.position.y), 0, lobby.map.h - 1);

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



    shootBullet(bullet: Bullet) {
        let lobby = this.lobbies[bullet.lobbyId];

        let newBullet = new Bullet(bullet.lobbyId, bullet.clientId, bullet.targetTeam, bullet.position, bullet.direction, bullet.type);
        lobby.newBullets.push(newBullet);
        lobby.bullets.push(newBullet);
    }




    update() {
        time.update();

        this.updateBullets();

        this.updateClients();

    }

    updateBullets() {
        for (let lobbyId in this.lobbies) {
            let lobby = this.lobbies[lobbyId];
            // if there are new bullets, send them to the clients
            if (lobby.newBullets.length > 0) {
                this.io.to(lobbyId).emit('bullets', lobby.newBullets);
                lobby.newBullets = [];
            }

            // update all bullets
            for (let index = lobby.bullets.length - 1; index >= 0; index--) {
                let bullet = lobby.bullets[index];
                bullet.update();

                // if one hits a client or a wall, remove it
                for (let clientId in lobby.clients) {
                    let client = lobby.clients[clientId];
                    if (bullet.hitTest(client, true)) break;
                }

                if (!bullet.active) {
                    lobby.bullets.splice(index, 1);
                }
            }
        }
    }

    updateClients() {
        for (let lobbyId in this.lobbies) {
            let lobby = this.lobbies[lobbyId];
            for (let clientId in lobby.clients) {
                let client: Clientserverside = lobby.clients[clientId];
                client.update();
            }
        }
    }
}
