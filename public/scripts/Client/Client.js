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
        this.respawnPosition = new Vector_1.default(this.position.x, this.position.y);
        this.moving = false;
        this.shooting = false;
        this.frame = 1;
    }
    Client.prototype.checkPortal = function (tile) {
        // if it's a portal
        if (tile.portal) {
            if (!this.justUsedPortal) {
                this.position.set(tile.portal.dx + 0.5, tile.portal.dy + 0.5);
                this.justUsedPortal = true;
            }
        }
        else {
            this.justUsedPortal = false;
        }
    };
    Client.prototype.respawn = function () {
        this.position.set(this.respawnPosition.x, this.respawnPosition.y);
        this.infos.spawned = true;
    };
    Client.prototype.modLife = function (delta) {
        this.infos.life += delta;
        if (this.infos.life <= 0) {
            this.infos.life = 0;
        }
    };
    return Client;
}());
exports.default = Client;
