import Vector from '../common/Vector';
import { Pickups } from '../common/Pickups';

/**
 * Handles a client
 * @param {string} name
 */
export default class Client {
    direction: Vector;
    position: Vector;
    infos: any;
    networkData: any;
    justUsedPortal: boolean;
    dead: boolean;
    moving: boolean;
    frame: number;

    constructor(name, clientId, team, position) {
        this.direction = new Vector(1, 0);
        this.position = new Vector(position.x, position.y);

        this.infos = {
            name: name,
            life: 100,
            shield: 100,
            weapon: Pickups.weapons.gun,
            ammo: 10,
            speed: 0.05,
            hasEnemyFlag: false,
            team: team,
            enemyTeam: (team == 'green' ? 'blue' : 'green')
        }

        this.networkData = {
            clientId: clientId,
            lastPosition: { x: this.position.x, y: this.position.y, dx: this.direction.x, dy: this.direction.y },
            sequence: 0,
            forceNoReconciliation: false,
            positionBuffer: [],
            pendingMovement: []
        }



        this.justUsedPortal = false;
        this.dead = false;
        this.moving = false;
        this.frame = 1;
    }

}
