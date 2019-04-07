"use strict";
exports.__esModule = true;
var Vector_1 = require("../common/Vector");
var Pickups_1 = require("../common/Pickups");
/**
 * Handles a client
 * @param {string} name
 */
var Client = /** @class */ (function () {
    function Client(name, clientId, team, position) {
        this.direction = new Vector_1["default"](1, 0);
        this.position = new Vector_1["default"](position.x, position.y);
        this.infos = {
            name: name,
            life: 100,
            shield: 100,
            weapon: Pickups_1.Pickups.weapons.gun,
            ammo: 10,
            speed: 0.05,
            hasEnemyFlag: false,
            team: team,
            enemyTeam: (team == 'green' ? 'blue' : 'green')
        };
        this.networkData = {
            clientId: clientId,
            lastPosition: { x: this.position.x, y: this.position.y, dx: this.direction.x, dy: this.direction.y },
            sequence: 0,
            forceNoReconciliation: false,
            positionBuffer: [],
            pendingMovement: []
        };
        this.justUsedPortal = false;
        this.dead = false;
        this.moving = false;
        this.frame = 1;
    }
    return Client;
}());
exports["default"] = Client;
