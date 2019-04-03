
/*module.exports =*/ class Network {
    constuctor() {
        this.network.startTime = 0;
        this.network.latency = 0;
        this.network.lastServerTimestamp = 0;
        this.socket = null;
    }

    init() {
        this.socket = io('http://localhost:3000');
        setInterval(function () {
            network.startTime = Date.now();
            network.socket.emit('pingtest');
        }, 2000);

        setInterval(function () {
            let client = Game.clients[Game.localClientId];
            if (client) {
                network.sendMovementData(client);
            }
        }, 100);


        this.socket.on('pongtest', function () {
            network.latency = Date.now() - network.startTime;
            // document.getElementById('ping').innerText = network.latency + 'ms';
        });



        this.socket.on('init', function (client) {
            Game.localClientId = client.networkData.clientId;
            Game.localClient = Game.clients[Game.localClientId] = new Client('Local player', Game.localClientId, client.infos.team, client.position);
        });

        this.socket.on('disconnected', function (clientId) {
            let team = map.teams[Game.clients[clientId].infos.team];
            for (let index = 0; index < team.length; index++) {
                if (team[index].clientId = clientId) {
                    team.splice(index, 1);
                    break;
                }
            }
            delete Game.clients[clientId];

        });

        this.socket.on('update', function (data) {
            let timestamp = +new Date();
            time.setServerDelay(timestamp);

            network.lastServerTimestamp = data.timestamp;
            let serverUsers = data.clients;
            for (let clientId in serverUsers) {
                let playerData = serverUsers[clientId];
                if (!Game.clients[clientId]) {
                    Game.clients[clientId] = new Client('Network player ' + Object.keys(Game.clients).length, playerData.networkData.clientId, playerData.infos.team, playerData.position);
                }

                let client = Game.clients[clientId];

                if (clientId == Game.localClientId) {

                    // if there was movement since the last server update, send it now
                    network.sendMovementData(client)

                    // Received the authoritative position of this client's client.
                    client.position.x = playerData.position.x;
                    client.position.y = playerData.position.y;
                    client.direction.x = playerData.direction.x;
                    client.direction.y = playerData.direction.y;


                    // Server Reconciliation. Re-apply all the inputs not yet processed by the server.
                    var j = 0;
                    while (j < client.networkData.pendingMovement.length) {
                        let movementData = client.networkData.pendingMovement[j];
                        if (movementData.sequence <= playerData.networkData.sequence) {
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

                } else {
                    // Received the position of an client other than this client's.

                    // Add it to the position buffer.
                    client.networkData.positionBuffer.push({ timestamp: timestamp, position: playerData.position, direction: playerData.direction });
                }
            }

        });

    }

    sendMovementData(client) {
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
            let movementData = { movement: deltaPosition, sequence: ++client.networkData.sequence };
            this.socket.emit('update', movementData);

            // store movements for later reconciliation
            client.networkData.pendingMovement.push(movementData);
        }
    }
}
//var socket = io('https://charpie.herokuapp.com/');
