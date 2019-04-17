import Vector from '../common/Vector';
import Map from '../Map/Map';
import Pickups from '../Pickups/Pickups';
import Infos from './Infos';
import MovementData from './MovementData';
import NetworkData from './NetworkData';
import Tile from '../Map/Tile';
declare var pickups: Pickups;
declare var map: Map;

/**
 * Handles a client
 * @param {string} name
 */
export default class Client {
    direction: Vector;
    position: Vector;
    infos: Infos;
    networkData: NetworkData;
    justUsedPortal: boolean;
    moving: boolean;
    respawnPosition: Vector;
    shooting: boolean;
    frame: number;
    name: string;

    constructor(name, lobbyId, clientId, team, position) {
        this.direction = new Vector(1, 0);
        this.position = new Vector(position.x, position.y);
        this.name = name;

        this.infos = new Infos(100, 0, false, pickups.weapons.gun, 0, .05, false, team);
        this.networkData = new NetworkData(lobbyId, clientId, new Vector(this.position.x, this.position.y), new Vector(this.direction.x, this.direction.y), 0, false, [], []);

        this.justUsedPortal = false;
        this.respawnPosition = new Vector(this.position.x, this.position.y);
        this.moving = false;
        this.shooting = false;
        this.frame = 1;
    }

    checkPortal(tile: Tile) {
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
    }

    respawn() {
        this.position.set(this.respawnPosition.x, this.respawnPosition.y);
        this.infos.spawned = true;
    }

    modLife(delta) {
        this.infos.life += delta;
        if (this.infos.life <= 0) {
            this.infos.life = 0;
        }
    }

}
