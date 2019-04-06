const Client = require('./Client');

module.exports = class Clientserverside extends Client {
    constructor(name, clientId, team, position) {
        super(name, clientId, team, position);
    }

    /**
     * Checks the tile the client is walking on
     * @param {Tile} tile
     * @param {Number} x
     * @param {Number} y
     */
    checkTile(tile, x, y) {

        // if it's a rogue flag (flag dropped by client)
        if (tile.flag) {
            let pickup = Pickups.flags[tile.flag];

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
            let name = tile.pickup.replace('pickup_', '');
            let pickup = Pickups.buffs[name] || Pickups.weapons[name] || Pickups.flags[name]
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
                    if (pickup.speed != 0) time.addTimer('buff', 3, { stat: 'speed', value: this.infos.speed, client: this });
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
    }
}