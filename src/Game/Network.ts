//import * as io from '/socket.io/socket.io.js';
import * as io from 'socket.io-client';
import Client from './Client.clientside';
import Game from './Game';
import Map from '../common/Map';
import Timer from '../common/Timer';
import Bullet from './Bullet';


//declare var io: Function;
declare var game: Game;
declare var map: Map;
declare var time: Timer;
declare var loop: Function;

export default class Network {
    latency: number;
    lastServerTimestamp: 0;
    socket: SocketIOClient.Socket;

    constuctor() {
        this.latency = 0;
        this.lastServerTimestamp = 0;
        this.socket = null;
    }

    init() {
        this.socket = io('http://localhost:3000');

        let _this = this;

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
            let client = game.clients[game.localClientId];
            if (client) {
                _this.sendMovementData(client);
            }
        }, 100);

        /**
         * Connected to the server
         * @param { clients: this.clients, maps: this.maps }
         */
        this.socket.on('init', function (serverData) {
            game.localClientId = serverData.clientId;
            game.lobbies = serverData.lobbies;
            game.menu.show();
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

        // bullet updates from the server
        this.socket.on('bullets', function (bullets) {
            _this.updateBullets(bullets);
        });

    }


    joinGame() {
        this.socket.emit('join', { clientId: game.localClientId, name: game.localClientName, lobbyId: game.lobbyId });
    }

    /**
     * Load map from server and add local client
     * @param {*} serverData
     * @param {*} callback
     */
    createClient(serverData) {
        let client = serverData.client;
        let mapData = serverData.map;
        map.parseMap(mapData);
        game.localClient = game.clients[game.localClientId] = new Client(client.name, client.networkData.lobbyId, client.networkData.clientId, client.infos.team, client.position);
    }

    deleteClient(clientId) {
        delete game.clients[clientId];
    }

    updateClient(serverData) {
        this.lastServerTimestamp = serverData.timestamp;
        map.updates = serverData.mapUpdates || [];
        map.processUpdates();

        let serverClients = serverData.clients;
        for (let clientId in serverClients) {
            let serverClient = serverClients[clientId];
            if (!game.clients[clientId]) {
                game.clients[clientId] = new Client(serverClient.name, serverClient.networkData.lobbyId, serverClient.networkData.clientId, serverClient.infos.team, serverClient.position);
            }

            let client = game.clients[clientId];

            if (clientId == game.localClientId) {
                // if there was movement since the last server update, send it now
                if (serverClient.networkData.forceNoReconciliation)
                    client.networkData.pendingMovement = [];
                else
                    this.sendMovementData(client)

                this.authoring(client, serverClient);

                this.reconciliation(client, serverClient);

            } else {
                client.infos = serverClient.infos;
                this.clientsPositionBuffer(client, serverClient);
            }
        }

    }

    /**
     * Apply the authoritative position of this client's client.
     * @param {*} client
     * @param {*} serverClient
     */
    authoring(client, serverClient) {
        client.position.x = serverClient.position.x;
        client.position.y = serverClient.position.y;
        client.direction.x = serverClient.direction.x;
        client.direction.y = serverClient.direction.y;
        client.infos = serverClient.infos;

        if (serverClient.networkData.forceNoReconciliation) {
            client.networkData.lastPosition.x = client.position.x;
            client.networkData.lastPosition.y = client.position.y;
        }

    }

    /**
     * Server Reconciliation. Re-apply all the inputs not yet processed by the server.
     * @param {*} client
     * @param {*} serverClient
     */
    reconciliation(client, serverClient) {
        var j = 0;
        while (j < client.networkData.pendingMovement.length) {
            let movementData = client.networkData.pendingMovement[j];
            if (movementData.sequence <= serverClient.networkData.sequence) {
                // Already processed. Its effect is already taken into account into the world update
                // we just got, so we can drop it.
                client.networkData.pendingMovement.splice(j, 1);
            } else {
                client.position.x += movementData.movement.x;
                client.position.y += movementData.movement.y;
                client.direction.x += movementData.movement.dx;
                client.direction.y += movementData.movement.dy;
                j++;
            }
        }

    }

    /**
     * Add the position of non local clients to the position buffer.
     * @param {*} client
     * @param {*} serverClient
     */
    clientsPositionBuffer(client, serverClient) {
        let timestamp = +new Date();
        time.setServerDelay(timestamp);



        if (serverClient.networkData.forceNoReconciliation) {
            client.networkData.positionBuffer = [];
            client.networkData.positionBuffer.push({ timestamp: timestamp - 1, position: serverClient.position, direction: serverClient.direction });
            client.position.x = serverClient.position.x;
            client.position.y = serverClient.position.y;
        }
        else
            client.networkData.positionBuffer.push({ timestamp: timestamp, position: serverClient.position, direction: serverClient.direction });
    }

    sendMovementData(client: Client) {
        // get movement since last one sent to server
        let deltaPosition = {
            x: client.position.x - client.networkData.lastPosition.x,
            y: client.position.y - client.networkData.lastPosition.y,
            dx: client.direction.x - client.networkData.lastPosition.dx,
            dy: client.direction.y - client.networkData.lastPosition.dy,
        }

        // If there was movement, notify the server
        if (Math.abs(deltaPosition.x) + Math.abs(deltaPosition.y) + Math.abs(deltaPosition.dx) + Math.abs(deltaPosition.dy) > 0) {
            client.networkData.lastPosition = { x: client.position.x, y: client.position.y, dx: client.direction.x, dy: client.direction.y };
            // send movement to server for validation
            let movementData = { movement: deltaPosition, sequence: ++client.networkData.sequence, lobbyId: client.networkData.lobbyId };

            this.socket.emit('update', movementData);

            // store movements for later reconciliation
            client.networkData.pendingMovement.push(movementData);
        }
    }

    /**
     * Shoots a bullet (origin = local)
     * @param client
     */
    shootWeapon(client: Client) {
        let bullet = new Bullet(client.networkData.lobbyId, client.networkData.clientId, client.infos.enemyTeam, client.position, client.direction, client.infos.weapon);
        game.bullets.push(bullet);
        this.socket.emit('shoot', bullet);
    }

    /**
     * Adds a bullet (origin = server)
     * @param bullets
     */
    updateBullets(bullets: Bullet[]) {
        for (let bullet of bullets) {
            if (bullet.clientId != game.localClientId) {
                let newBullet = new Bullet(bullet.lobbyId, bullet.clientId, bullet.targetTeam, bullet.position, bullet.direction, bullet.type);
                game.bullets.push(newBullet);
            }
        }
    }
}
//var socket = io('https://charpie.herokuapp.com/');
