"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector_1 = require("../common/Vector");
var Infos_1 = require("./Infos");
var NetworkData_1 = require("./NetworkData");
/**
 * Handles a client
 * @param {string} name
 */
var Client = /** @class */ (function () {
    function Client(name, lobbyId, clientId, team, position) {
        this.direction = new Vector_1.default(1, 0);
        this.position = new Vector_1.default(position.x, position.y);
        this.name = name;
        this.infos = new Infos_1.default(100, 0, false, pickups.weapons.gun, 0, .05, false, team);
        this.networkData = new NetworkData_1.default(lobbyId, clientId, new Vector_1.default(this.position.x, this.position.y), new Vector_1.default(this.direction.x, this.direction.y), 0, false, [], []);
        this.justUsedPortal = false;
        this.moving = false;
        this.shooting = false;
        this.frame = 1;
    }
    return Client;
}());
exports.default = Client;
