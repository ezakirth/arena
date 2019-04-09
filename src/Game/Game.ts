import Clientclientside from './Client.clientside';
import Graphics from '../common/Graphics';
import Bullet from './Bullet';

declare var gfx: Graphics


export default class Game {
    bullets: Array<Bullet>;
    clients: any;
    localClientId: string;
    localClient: Clientclientside;
    constructor() {
        this.clients = {};
        this.bullets = [];
        this.localClientId = null;
        this.localClient = null;

    }

    update() {
        for (let clientId in this.clients) {
            this.clients[clientId].update();
        }

        for (let bullet of this.bullets) {
            bullet.update();
        }
    }

    render() {
        gfx.clear();
        gfx.sprite("bg", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);


        if (this.localClient) this.localClient.renderLocal();
        gfx.sprite("vignette", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);

    }
}
