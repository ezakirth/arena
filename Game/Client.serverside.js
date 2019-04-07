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
exports.__esModule = true;
var Client_1 = require("./Client");
var Pickups_1 = require("../common/Pickups");
var Clientserverside = /** @class */ (function (_super) {
    __extends(Clientserverside, _super);
    function Clientserverside(name, clientId, team, position) {
        return _super.call(this, name, clientId, team, position) || this;
    }
    /**
     * Checks the tile the client is walking on
     * @param tile
     * @param x
     * @param y
     */
    Clientserverside.prototype.checkTile = function (tile, x, y) {
        // if it's a rogue flag (flag dropped by client)
        if (tile.flag) {
            var pickup = Pickups_1.Pickups.flags[tile.flag];
            // if it's enemy flag, we take it
            if (pickup.name == 'flag_' + this.infos.enemyTeam) {
                this.infos.hasEnemyFlag = true;
            }
            // else it's our flag, so we return it
            else {
                time.addTimer('respawn', 0, { pickup: 'pickup_flag_' + this.infos.team, x: map.flags[this.infos.team].x, y: map.flags[this.infos.team].y });
            }
            map.queueUpdate('flag', null, x, y);
        }
        // if it's a pickup (weapon, buff, flag)
        if (tile.pickup) {
            var name_1 = tile.pickup.replace('pickup_', '');
            var pickup = Pickups_1.Pickups.buffs[name_1] || Pickups_1.Pickups.weapons[name_1] || Pickups_1.Pickups.flags[name_1];
            if (pickup) {
                // if client walks on a weapon, equip it and trigger respawn time
                if (pickup.type == 'weapon') {
                    this.infos.weapon = pickup;
                    this.infos.ammo = pickup.ammo;
                    time.addTimer('respawn', 10, { pickup: tile.pickup, x: x, y: y });
                    map.queueUpdate('pickup', null, x, y);
                }
                // if client walks on a buff, consume it and trigger respawn time
                if (pickup.type == 'buff') {
                    this.infos.life += pickup.life;
                    this.infos.shield += pickup.shield;
                    if (pickup.speed != 0)
                        time.addTimer('buff', 3, { stat: 'speed', value: this.infos.speed, client: this });
                    this.infos.speed += pickup.speed;
                    time.addTimer('respawn', 10, { pickup: tile.pickup, x: x, y: y });
                    map.queueUpdate('pickup', null, x, y);
                }
                // if client walks on a flag, process it
                if (pickup.type == 'flag') {
                    // if it's the enemy team's flag, the client takes it
                    if (pickup.name == 'flag_' + this.infos.enemyTeam) {
                        this.infos.hasEnemyFlag = true;
                        map.queueUpdate('pickup', null, x, y);
                    }
                    // else it's the client's flag
                    else {
                        // If we are at our flag spawn location and have the enemy flag, capture it
                        if (map.flags[this.infos.team].x == x && map.flags[this.infos.team].y == y && this.infos.hasEnemyFlag) {
                            time.addTimer('respawn', 10, { pickup: 'pickup_flag_' + this.infos.enemyTeam, x: map.flags[this.infos.enemyTeam].x, y: map.flags[this.infos.enemyTeam].y });
                            this.infos.hasEnemyFlag = false;
                        }
                    }
                }
            }
        }
        // if it's a portal
        if (tile.portal) {
            if (!this.justUsedPortal) {
                this.position.x = tile.portal.dx + 0.5;
                this.position.y = tile.portal.dy + 0.5;
                this.justUsedPortal = true;
                this.networkData.forceNoReconciliation = true;
            }
        }
        else {
            this.justUsedPortal = false;
        }
    };
    return Clientserverside;
}(Client_1["default"]));
exports["default"] = Clientserverside;
