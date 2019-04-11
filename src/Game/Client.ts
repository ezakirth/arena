import Vector from '../common/Vector';
import Map from '../common/Map';
import Pickups from '../common/Pickups';
import Infos from '../types/Infos';

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
    networkData: any;
    justUsedPortal: boolean;
    moving: boolean;
    shooting: boolean;
    frame: number;
    name: string;

    constructor(name, lobbyId, clientId, team, position) {
        this.direction = new Vector(1, 0);
        this.position = new Vector(position.x, position.y);
        this.name = name;
        this.infos = new Infos(100, 100, false, pickups.weapons.gun, 10, 0.05, false, team);

        this.networkData = {
            lobbyId: lobbyId,
            clientId: clientId,
            lastPosition: new Vector(this.position.x, this.position.y),
            lastDirection: new Vector(this.direction.x, this.direction.y),
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



}
