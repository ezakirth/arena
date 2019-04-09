import Vector from '../common/Vector';
import Map from '../common/Map';
import { Pickups } from '../common/Pickups';

declare var map: Map;

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
    moving: boolean;
    shooting: boolean;
    frame: number;
    name: string;

    constructor(name, clientId, team, position) {
        this.direction = new Vector(1, 0);
        this.position = new Vector(position.x, position.y);
        this.name = name;
        this.infos = {
            life: 100,
            shield: 100,
            dead: false,
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
        this.moving = false;
        this.shooting = false;
        this.frame = 1;
    }

    respawn() {
        this.position = map.assignSpawnToClient(this.infos.team);

        this.infos.life = 100;
        this.infos.shield = 100;
        this.infos.dead = false;
        this.infos.speed = 0.05;
        this.infos.weapon = Pickups.weapons.gun;
        this.networkData.forceNoReconciliation = true;

    }

}
