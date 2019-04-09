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


    render() {
        gfx.clear();
        gfx.sprite("bg", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);

        if (this.localClient) this.localClient.renderLocal();

        gfx.sprite("vignette", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);

    }

    update() {
        for (let clientId in this.clients) {
            this.clients[clientId].update();
        }

        for (let index = this.bullets.length - 1; index >= 0; index--) {
            let bullet = this.bullets[index];
            bullet.update();

            for (let clientId in this.clients) {
                let client = this.clients[clientId];
                if (bullet.hitTest(client, false)) break;
            }

            if (!bullet.active) {
                this.bullets.splice(index, 1);
            }
        }
    }

}
