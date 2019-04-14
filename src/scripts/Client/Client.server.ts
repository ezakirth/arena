import Client from './Client';
import Timer from '../common/Timer';
import Tile from '../Map/Tile';
import Pickups from '../Pickups/Pickups';
import Vector from '../common/Vector';
import Server, { clamp } from '../server/Server';

declare var server: Server;
declare var time: Timer;
declare var pickups: Pickups;

export default class ClientServer extends Client {
    lastGoodPos: Vector;
    constructor(name, lobbyId, clientId, team, position) {
        super(name, lobbyId, clientId, team, position);
        this.lastGoodPos = new Vector(position.x, position.y);
    }

    update() {
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
    }



    modLife(delta) {
        this.infos.life += delta;
        if (this.infos.life <= 0) {
            this.infos.life = 0;
            this.die();
        }
    }


    /**
     * Kills the client (drops flag if he was carrying)
     */
    die() {
        if (this.infos.hasEnemyFlag) {
            let px = Math.floor(this.position.x);
            let py = Math.floor(this.position.y);
            server.lobbies[this.networkData.lobbyId].map.queueUpdate('flag', 'pickup_flag_' + this.infos.enemyTeam, px, py);
            this.infos.hasEnemyFlag = false;
        }
        this.infos.dead = true;
        this.infos.score.deaths++;

        this.infos.respawnTime = 8;
    }




    /**
     * Checks the tile the client is walking on
     * @param tile
     * @param x
     * @param y
     * @returns flagAction
     */
    checkTile(tile: Tile, x: number, y: number): string {
        let flagAction = null;
        if (!this.infos.dead) {
            let map = server.lobbies[this.networkData.lobbyId].map;

            // if it's a rogue flag (flag dropped by client)
            if (tile.flag) {
                let name = tile.flag.replace('pickup_', '');
                let pickup = pickups.flags[name];

                // if it's enemy flag, we take it
                if (pickup.name == 'flag_' + this.infos.enemyTeam) {
                    this.infos.hasEnemyFlag = true;
                    flagAction = 'taken'
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
                let name = tile.pickup.replace('pickup_', '');
                let pickup = pickups.buffs[name] || pickups.weapons[name] || pickups.flags[name]
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
                        this.infos.life = clamp(this.infos.life, 0, 100);
                        this.infos.shield = clamp(this.infos.shield, 0, 100);
                        if (pickup.speed != 0) time.addTimer('buff', 3, { stat: 'speed', value: pickup.speed, client: this });
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

    }
}
