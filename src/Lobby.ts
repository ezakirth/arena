import Map from "./common/Map";
import UUIDV1 = require('uuid/v1');
import Clientserverside from "./Game/Client.serverside";
import Bullet from "./Game/Bullet";

export default class Lobby {
    id: string;
    clients: { [name: string]: Clientserverside };
    teams: any;
    bullets: Bullet[];
    newBullets: Bullet[];
    history: any;
    map: Map;

    constructor(map: Map) {
        this.id = UUIDV1();
        this.clients = {};
        this.teams = { blue: [], green: [] };
        this.bullets = [];
        this.newBullets = [];
        this.history = {};
        this.map = map;
    }
}
