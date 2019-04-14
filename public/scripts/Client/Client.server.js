"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Client_1 = require("./Client");
var Vector_1 = require("../common/Vector");
var Server_1 = require("../server/Server");
var ClientServer = /** @class */ (function (_super) {
    __extends(ClientServer, _super);
    function ClientServer(name, lobbyId, clientId, team, position) {
        var _this = _super.call(this, name, lobbyId, clientId, team, position) || this;
        _this.lastGoodPos = new Vector_1.default(position.x, position.y);
        return _this;
    }
    ClientServer.prototype.update = function () {
        if (this.infos.dead) {
            this.infos.respawnTime -= time.delta;
            if (this.infos.respawnTime <= 0) {
                this.respawnPosition = server.lobbies[this.networkData.lobbyId].map.assignSpawnToClient(this.infos.team);
                this.infos.life = 100;
                this.infos.shield = 0;
                this.infos.dead = false;
                this.infos.speed = 0.05;
                this.infos.weapon = pickups.weapons.gun;
                this.infos.spawned = false;
            }
        }
    };
    ClientServer.prototype.modLife = function (delta) {
        this.infos.life += delta;
        if (this.infos.life <= 0) {
            this.infos.life = 0;
            this.die();
        }
    };
    /**
     * Kills the client (drops flag if he was carrying)
     */
    ClientServer.prototype.die = function () {
        if (this.infos.hasEnemyFlag) {
            var px = Math.floor(this.position.x);
            var py = Math.floor(this.position.y);
            server.lobbies[this.networkData.lobbyId].map.queueUpdate('flag', 'pickup_flag_' + this.infos.enemyTeam, px, py);
            this.infos.hasEnemyFlag = false;
        }
        this.infos.dead = true;
        this.infos.score.deaths++;
        this.infos.respawnTime = 8;
    };
    /**
     * Checks the tile the client is walking on
     * @param tile
     * @param x
     * @param y
     * @returns flagAction
     */
    ClientServer.prototype.checkTile = function (tile, x, y) {
        var flagAction = null;
        if (!this.infos.dead) {
            var map = server.lobbies[this.networkData.lobbyId].map;
            // if it's a rogue flag (flag dropped by client)
            if (tile.flag) {
                var name_1 = tile.flag.replace('pickup_', '');
                var pickup = pickups.flags[name_1];
                // if it's enemy flag, we take it
                if (pickup.name == 'flag_' + this.infos.enemyTeam) {
                    this.infos.hasEnemyFlag = true;
                    flagAction = 'taken';
                }
                // else it's our flag, so we return it
                else {
                    time.addTimer('respawn', 0, { pickup: 'pickup_flag_' + this.infos.team, x: map.flags[this.infos.team].x, y: map.flags[this.infos.team].y, map: map });
                    this.infos.score.returns++;
                    flagAction = 'returned';
                }
                map.queueUpdate('flag', null, x, y);
            }
            // if it's a pickup (weapon, buff, flag)
            if (tile.pickup) {
                var name_2 = tile.pickup.replace('pickup_', '');
                var pickup = pickups.buffs[name_2] || pickups.weapons[name_2] || pickups.flags[name_2];
                if (pickup) {
                    // if client walks on a weapon, equip it and trigger respawn time
                    if (pickup.type == 'weapon') {
                        this.infos.weapon = pickup;
                        this.infos.ammo = pickup.ammo;
                        time.addTimer('respawn', 10, { pickup: tile.pickup, x: x, y: y, map: map });
                        map.queueUpdate('pickup', null, x, y);
                    }
                    // if client walks on a buff, consume it and trigger respawn time
                    if (pickup.type == 'buff') {
                        this.infos.life += pickup.life;
                        this.infos.shield += pickup.shield;
                        this.infos.life = Server_1.clamp(this.infos.life, 0, 100);
                        this.infos.shield = Server_1.clamp(this.infos.shield, 0, 100);
                        if (pickup.speed != 0)
                            time.addTimer('buff', 3, { stat: 'speed', value: pickup.speed, client: this });
                        this.infos.speed += pickup.speed;
                        time.addTimer('respawn', 10, { pickup: tile.pickup, x: x, y: y, map: map });
                        map.queueUpdate('pickup', null, x, y);
                    }
                    // if client walks on a flag, process it
                    if (pickup.type == 'flag') {
                        // if it's the enemy team's flag, the client takes it
                        if (pickup.name == 'flag_' + this.infos.enemyTeam) {
                            this.infos.hasEnemyFlag = true;
                            map.queueUpdate('pickup', null, x, y);
                            flagAction = 'taken';
                        }
                        // else it's the client's flag
                        else {
                            // If we are at our flag spawn location and have the enemy flag, capture it
                            if (map.flags[this.infos.team].x == x && map.flags[this.infos.team].y == y && this.infos.hasEnemyFlag) {
                                time.addTimer('respawn', 10, { pickup: 'pickup_flag_' + this.infos.enemyTeam, x: map.flags[this.infos.enemyTeam].x, y: map.flags[this.infos.enemyTeam].y, map: map });
                                this.infos.hasEnemyFlag = false;
                                this.infos.score.captures++;
                                flagAction = 'captured';
                            }
                        }
                    }
                }
            }
        }
        return flagAction;
    };
    return ClientServer;
}(Client_1.default));
exports.default = ClientServer;
