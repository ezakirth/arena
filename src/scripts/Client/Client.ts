import Vector from '../common/Vector';
import Map from '../Map/Map';
import Pickups from '../Pickups/Pickups';
import Infos from './Infos';
import MovementData from './MovementData';
import NetworkData from './NetworkData';

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
        this.moving = false;
        this.shooting = false;
        this.frame = 1;
    }



}
