import Clientclientside from './Client.clientside';
import Graphics from '../common/Graphics';
import Bullet from './Bullet';
import Menu from './Menu';

declare var gfx: Graphics


export default class Game {
    bullets: Bullet[];
    clients: { [name: string]: Clientclientside };
    lobbies: any[];
    mapList: any[];
    menu: Menu;
    localClientId: string;
    localClient: Clientclientside;
    localClientName: string;
    lobbyId: string;
    constructor() {
        this.clients = {};
        this.bullets = [];
        this.lobbies = [];
        this.localClientId = null;
        this.localClient = null;
        this.localClientName = null;
        this.lobbyId = null;
        this.menu = new Menu();

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
            if (bullet.active) {
                bullet.update();

                for (let clientId in this.clients) {
                    let client = this.clients[clientId];
                    if (bullet.hitTest(client, false)) break;
                }

            }
            else {
                this.bullets.splice(index, 1);
            }
        }
    }

}
