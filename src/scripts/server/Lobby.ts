import Map from "../Map/Map";
import UUIDV1 = require('uuid/v1');
import ClientServer from "../Client/Client.server";
import Projectile from "../Main/Projectile";

export default class Lobby {
    id: string;
    mapId: string;
    clients: { [name: string]: ClientServer };
    teams: any;
    projectiles: Projectile[];
    newBullets: Projectile[];
    history: any;
    map: Map;

    constructor(map: Map, mapId: string) {
        this.id = UUIDV1();
        this.mapId = mapId;
        this.clients = {};
        this.teams = { blue: [], green: [] };
        this.projectiles = [];
        this.newBullets = [];
        this.history = {};
        this.map = map;
    }
}
