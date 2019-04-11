//import * as io from '/socket.io/socket.io.js';
import * as io from 'socket.io-client';
import Client from './Client.clientside';
import Game from './Game';
import Map from '../common/Map';
import Timer from '../common/Timer';
import Bullet from './Bullet';
import Vector from '../common/Vector';
import Clientserverside from './Client.serverside';
import Clientclientside from './Client.clientside';
import MovementData from '../types/MovementData';
import PositionBuffer from '../types/PositionBuffer';


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
     */
    createClient(serverData: any) {
        let client = serverData.client;
        let mapData = serverData.map;
        map.parseMap(mapData);
        game.localClient = game.clients[game.localClientId] = new Client(client.name, client.networkData.lobbyId, client.networkData.clientId, client.infos.team, client.position);
    }

    deleteClient(clientId: string) {
        delete game.clients[clientId];
    }

    updateClient(serverData: any) {
        this.lastServerTimestamp = serverData.timestamp;
        map.updates = serverData.mapUpdates || [];
        map.processUpdates();

        let serverClients = serverData.clients;
        for (let clientId in serverClients) {
            let serverClient: Clientserverside = serverClients[clientId];
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
                client.infos.apply(serverClient.infos);
                this.clientsPositionBuffer(client, serverClient);
            }
        }

    }

    /**
     * Apply the authoritative position of this client's client.
     * @param {Clientclientside} client
     * @param {Clientserverside} serverClient
     */
    authoring(client: Clientclientside, serverClient: Clientserverside) {
        client.position.set(serverClient.position.x, serverClient.position.y);
        client.direction.set(serverClient.direction.x, serverClient.direction.y);
        client.infos.apply(serverClient.infos);

        if (serverClient.networkData.forceNoReconciliation) {
            client.networkData.lastPosition.set(client.position.x, client.position.y);
            client.networkData.lastDirection.set(client.direction.x, client.direction.y);
        }

    }

    /**
     * Server Reconciliation. Re-apply all the inputs not yet processed by the server.
     * @param {Clientclientside} client
     * @param {Clientserverside} serverClient
     */
    reconciliation(client: Clientclientside, serverClient: Clientserverside) {
        var j = 0;
        while (j < client.networkData.pendingMovement.length) {
            let movementData = client.networkData.pendingMovement[j];
            if (movementData.sequence <= serverClient.networkData.sequence) {
                // Already processed. Its effect is already taken into account into the world update
                // we just got, so we can drop it.
                client.networkData.pendingMovement.splice(j, 1);
            } else {
                client.position.add(movementData.deltaPosition);
                client.direction.add(movementData.deltaDirection);
                j++;
            }
        }

    }

    /**
     * Add the position of non local clients to the position buffer.
     * @param {Clientclientside} client
     * @param {Clientserverside} serverClient
     */
    clientsPositionBuffer(client: Clientclientside, serverClient: Clientserverside) {
        let timestamp = +new Date();
        time.setServerDelay(timestamp);

        if (serverClient.networkData.forceNoReconciliation) {
            client.networkData.positionBuffer = [];
            client.networkData.positionBuffer.push(new PositionBuffer(timestamp - 1, serverClient.position, serverClient.direction));
            client.position.set(serverClient.position.x, serverClient.position.y);
            client.direction.set(serverClient.direction.x, serverClient.direction.y);
        }
        else
            client.networkData.positionBuffer.push(new PositionBuffer(timestamp, serverClient.position, serverClient.direction));
    }

    sendMovementData(client: Clientclientside) {
        // get movement since last one sent to server
        let deltaPosition = new Vector(client.position.x - client.networkData.lastPosition.x, client.position.y - client.networkData.lastPosition.y);
        let deltaDirection = new Vector(client.direction.x - client.networkData.lastDirection.x, client.direction.y - client.networkData.lastDirection.y);


        // If there was movement, notify the server
        if (Math.abs(deltaPosition.x) + Math.abs(deltaPosition.y) + Math.abs(deltaDirection.x) + Math.abs(deltaDirection.y) > 0) {
            client.networkData.lastPosition.set(client.position.x, client.position.y);
            client.networkData.lastDirection.set(client.direction.x, client.direction.y);
            // send movement to server for validation
            let movementData: MovementData = new MovementData(deltaPosition, deltaDirection, ++client.networkData.sequence, client.networkData.lobbyId);

            this.socket.emit('update', movementData);

            // store movements for later reconciliation
            client.networkData.pendingMovement.push(movementData);
        }
    }

    /**
     * Shoots a bullet (origin = local)
     * @param client
     */
    shootWeapon(client: Clientclientside) {
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
