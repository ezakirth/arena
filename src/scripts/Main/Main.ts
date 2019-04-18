import ClientLocal from '../Client/Client.local';
import Graphics from '../common/Graphics';
import Projectile from './Projectile';
import Menu from './Menu';

declare var gfx: Graphics


export default class Main {
    projectiles: Projectile[];
    clients: { [name: string]: ClientLocal };
    lobbies: any[];
    mapList: any[];
    tiles: number;
    menu: Menu;
    localClientId: string;
    localClient: ClientLocal;
    localClientName: string;
    lobbyId: string;
    noAuthoring: boolean;
    constructor() {
        this.noAuthoring = false;
        this.clients = {};
        this.projectiles = [];
        this.lobbies = [];
        this.localClientId = null;
        this.localClient = null;
        this.localClientName = null;
        this.lobbyId = null;
        this.menu = new Menu();
        this.tiles = 0;

    }


    render() {
        gfx.clear();
        gfx.sprite("bg", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);
        this.tiles = 0;
        if (this.localClient) this.localClient.renderLocal();
        gfx.sprite("vignette", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);

    }

    update() {
        for (let clientId in this.clients) {
            this.clients[clientId].update();
        }

        for (let index = this.projectiles.length - 1; index >= 0; index--) {
            let projectile = this.projectiles[index];
            if (projectile.active) {
                projectile.update();

                for (let clientId in this.clients) {
                    let client = this.clients[clientId];
                    if (projectile.hitTest(client, false))
                        break;
                }

            }
            else {
                this.projectiles.splice(index, 1);
            }
        }
    }

}
