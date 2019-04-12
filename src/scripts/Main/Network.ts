//import * as io from '/socket.io/socket.io.js';
import * as io from 'socket.io-client';
import Client from '../Client/Client.local';
import Main from './Main';
import Map from '../Map/Map';
import Timer from '../common/Timer';
import Projectile from './Projectile';
import Vector from '../common/Vector';
import ClientServer from '../Client/Client.server';
import ClientLocal from '../Client/Client.local';
import MovementData from '../Client/MovementData';
import PositionBuffer from '../Client/PositionBuffer';


//declare var io: Function;
declare var main: Main;
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
        this.socket = io();//'http://localhost:3000');

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
            let client = main.clients[main.localClientId];
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

    }


    joinGame(mapPath: string) {
        this.socket.emit('join', { clientId: main.localClientId, name: main.localClientName, lobbyId: main.lobbyId, mapPath: mapPath });
    }

    /**
     * Load map from server and add local client
     * @param {*} serverData
     */
    createClient(serverData: any) {
        let client = serverData.client;
        let mapInfo = serverData.mapInfo;
        map.parseMap(mapInfo);
        main.localClient = main.clients[main.localClientId] = new Client(client.name, client.networkData.lobbyId, client.networkData.clientId, client.infos.team, client.position);
    }

    deleteClient(clientId: string) {
        delete main.clients[clientId];
    }

    updateClient(serverData: any) {
        this.lastServerTimestamp = serverData.timestamp;
        map.updates = serverData.mapUpdates || [];
        map.processUpdates();

        let serverClients = serverData.clients;
        for (let clientId in serverClients) {
            let serverClient: ClientServer = serverClients[clientId];

            // if client doesn't exist locally, create it
            if (!main.clients[clientId]) {
                main.clients[clientId] = new Client(serverClient.name, serverClient.networkData.lobbyId, serverClient.networkData.clientId, serverClient.infos.team, serverClient.position);
            }

            let client = main.clients[clientId];

            if (clientId == main.localClientId) {
                // server tells us to ignore our movement, so we just apply authoring, no reconciliation
                if (serverClient.networkData.ignoreClientMovement) {
                    client.networkData.reconciliationMovement = [];
                    this.authoring(client, serverClient);
                    client.savePositionForReconciliation();
                    client.networkData.appliedAuthoring = true;
                }
                else {
                    client.networkData.appliedAuthoring = false;
                    // if there was movement since the last server update, send it now
                    this.sendMovementData(client)

                    // apply authoring and reconciliation
                    this.authoring(client, serverClient);
                    this.reconciliation(client, serverClient);
                }

            } else {
                client.infos.apply(serverClient.infos);
                this.clientsPositionBuffer(client, serverClient);
            }
        }

    }

    /**
     * Apply the authoritative position of this client's client.
     * @param {ClientLocal} client
     * @param {ClientServer} serverClient
     */
    authoring(client: ClientLocal, serverClient: ClientServer) {
        client.position.set(serverClient.position.x, serverClient.position.y);
        client.direction.set(serverClient.direction.x, serverClient.direction.y);
        client.infos.apply(serverClient.infos);
    }

    /**
     * Server Reconciliation. Re-apply all the inputs not yet processed by the server.
     * @param {ClientLocal} client
     * @param {ClientServer} serverClient
     */
    reconciliation(client: ClientLocal, serverClient: ClientServer) {
        var j = 0;
        while (j < client.networkData.reconciliationMovement.length) {
            let movementData = client.networkData.reconciliationMovement[j];
            if (movementData.sequence <= serverClient.networkData.sequence) {
                // Already processed. Its effect is already taken into account into the world update
                // we just got, so we can drop it.
                client.networkData.reconciliationMovement.splice(j, 1);
            } else {
                client.position.add(movementData.deltaPosition);
                client.direction.add(movementData.deltaDirection);
                j++;
            }
        }

    }

    /**
     * Add the position of non local clients to the position buffer.
     * @param {ClientLocal} client
     * @param {ClientServer} serverClient
     */
    clientsPositionBuffer(client: ClientLocal, serverClient: ClientServer) {
        let timestamp = +new Date();
        time.setServerDelay(timestamp);

        // if client was forced to a position by server, we don't want to interpolate (after using a portal for example)
        if (serverClient.networkData.ignoreClientMovement) {
            client.networkData.positionBuffer = [];
            client.networkData.positionBuffer.push(new PositionBuffer(timestamp - 1, serverClient.position, serverClient.direction));
            client.position.set(serverClient.position.x, serverClient.position.y);
            client.direction.set(serverClient.direction.x, serverClient.direction.y);
        }
        else
            client.networkData.positionBuffer.push(new PositionBuffer(timestamp, serverClient.position, serverClient.direction));
    }

    sendMovementData(client: ClientLocal) {
        // get movement since last one sent to server
        let deltaPosition = new Vector(client.position.x - client.networkData.lastPosition.x, client.position.y - client.networkData.lastPosition.y);
        let deltaDirection = new Vector(client.direction.x - client.networkData.lastDirection.x, client.direction.y - client.networkData.lastDirection.y);


        // If there was movement, notify the server
        if (client.networkData.appliedAuthoring || Math.abs(deltaPosition.x) + Math.abs(deltaPosition.y) + Math.abs(deltaDirection.x) + Math.abs(deltaDirection.y) > 0) {
            client.savePositionForReconciliation();
            // send movement to server for validation
            let movementData: MovementData = new MovementData(deltaPosition, deltaDirection, ++client.networkData.sequence, client.networkData.appliedAuthoring, client.networkData.lobbyId);

            this.socket.emit('update', movementData);


            client.networkData.appliedAuthoring = false;

            // store movements for later reconciliation
            client.networkData.reconciliationMovement.push(movementData);
        }
    }

    /**
     * Shoots a projectile (origin = local)
     * @param client
     */
    shootWeapon(client: ClientLocal) {
        let projectile: Projectile = null;

        if (client.infos.weapon.name == "shotgun") {
            // random projectiles that won't be pushed to server
            for (let i = 0; i < 8; i++) {
                let ang = (-15 + Math.random() * 30) * Math.PI / 180;
                projectile = new Projectile(client.networkData.lobbyId, client.networkData.clientId, (map.gameType == 'Deathmatch' ? 'any' : client.infos.enemyTeam), client.position, Vector._rotate(client.direction, ang), client.infos.weapon);
                main.projectiles.push(projectile);
            }
            projectile = new Projectile(client.networkData.lobbyId, client.networkData.clientId, (map.gameType == 'Deathmatch' ? 'any' : client.infos.enemyTeam), client.position, client.direction, client.infos.weapon);
            main.projectiles.push(projectile);
        }
        else {
            let ang = 0;
            if (client.infos.weapon.name == "blastgun")
                ang = (-5 + Math.random() * 10) * Math.PI / 180;
            projectile = new Projectile(client.networkData.lobbyId, client.networkData.clientId, (map.gameType == 'Deathmatch' ? 'any' : client.infos.enemyTeam), client.position, Vector._rotate(client.direction, ang), client.infos.weapon);
            main.projectiles.push(projectile);
        }
        this.socket.emit('shoot', projectile);
    }

    /**
     * Adds a projectile (origin = server)
     * @param projectiles
     */
    updateBullets(projectiles: Projectile[]) {
        for (let projectile of projectiles) {
            if (projectile.clientId != main.localClientId) {
                let newBullet = new Projectile(projectile.lobbyId, projectile.clientId, projectile.targetTeam, projectile.position, projectile.direction, projectile.type);
                main.projectiles.push(newBullet);

                if (projectile.type.name == "shotgun") {
                    // random projectiles that won't be pushed to server
                    for (let i = 0; i < 8; i++) {
                        let ang = (-15 + Math.random() * 30) * Math.PI / 180;
                        newBullet = new Projectile(projectile.lobbyId, projectile.clientId, projectile.targetTeam, projectile.position, Vector._rotate(projectile.direction, ang), projectile.type);
                        main.projectiles.push(newBullet);
                    }
                }
            }
        }
    }
}
//var socket = io('https://charpie.herokuapp.com/');
