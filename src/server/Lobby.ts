import Map from "../Map/Map";
import UUIDV1 = require('uuid/v1');
import Clientserverside from "../Main/Client.serverside";
import Projectile from "../Main/Projectile";

export default class Lobby {
    id: string;
    clients: { [name: string]: Clientserverside };
    teams: any;
    projectiles: Projectile[];
    newBullets: Projectile[];
    history: any;
    map: Map;

    constructor(map: Map) {
        this.id = UUIDV1();
        this.clients = {};
        this.teams = { blue: [], green: [] };
        this.projectiles = [];
        this.newBullets = [];
        this.history = {};
        this.map = map;
    }
}
