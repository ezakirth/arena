var Vector = require('../common/Vector');
var Pickups = require('../common/Pickups');
/**
 * Handles a client
 * @param {string} name
 */
module.exports = class Client {
    /**
     * Creates a client instance
     * @param {string} name
     */
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
