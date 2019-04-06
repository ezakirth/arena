const Client = require('./js/Game/Client.serverside');

module.exports = class Server {
    constructor(io) {
        this.io = io;
        this.clients = {};
        this.teams = { blue: [], green: [] };
        this.history = {};



    }

    createClient(socket) {
        let clientId = socket.id;
        let team = (this.teams.blue.length >= this.teams.green.length ? 'green' : 'blue');
        this.teams[team].push(clientId);

        let client = new Client('clientname', clientId, team, map.assignSpawnToClient(team));
        this.clients[clientId] = client;
        socket.emit('init', { client: client, map: map.data });
    }

    deleteClient(socket) {
        let clientId = socket.id;
        delete this.teams[this.clients[clientId].infos.team][clientId];
        delete this.clients[clientId];
        this.io.emit('disconnected', clientId);
    }

    updateClient(socket, movementData) {
        let clientId = socket.id;
        let client = this.clients[clientId];
        if (!client.networkData.forceNoReconciliation) {
            client.position.x += movementData.movement.x;
            client.position.y += movementData.movement.y;
            client.direction.x += movementData.movement.dx;
            client.direction.y += movementData.movement.dy;
            client.networkData.sequence = movementData.sequence;

            let px = Math.floor(client.position.x).clamp(0, map.w - 1);
            let py = Math.floor(client.position.y).clamp(0, map.h - 1);

            if (!map.data[px][py].solid) client.lastGoodPos = { x: client.position.x, y: client.position.y };
            else { client.position = { x: client.lastGoodPos.x, y: client.lastGoodPos.y }; }
            client.checkTile(map.data[px][py], px, py);
        }


    }

    notifyClients() {
        let timestamp = +new Date();
        this.history[timestamp] = JSON.parse(JSON.stringify(server.clients));
        let list = Object.keys(this.history);
        if (list.length > 10) {
            delete this.history[list[0]];
        }


        this.io.emit('update', { timestamp: timestamp, clients: this.clients, mapUpdates: map.updates });
        map.processUpdates();

        for (let clientId in this.clients) {
            this.clients[clientId].networkData.forceNoReconciliation = false;
        }

    }
}