import Vector from '../common/Vector';
import Pickups from '../common/Pickups';
import Game from './Game';
import Map from '../common/Map';
import Timer from '../common/Timer';
import Graphics from '../common/Graphics';
import Clientserverside from './Client.serverside';

declare var game: Game;
declare var map: Map;
declare var gfx: Graphics;
declare var pickups: Pickups;

declare var tileSize: number;
declare var time: Timer;
/**
 * Handles a bullet
 */
export default class Bullet {
    direction: Vector;
    position: Vector;
    type: any;
    origin: Vector;
    distance: number;
    targetTeam: string;
    active: boolean;
    clientId: string;
    speed: number;
    constructor(clientId, targetTeam, position, direction, type) {
        this.clientId = clientId;
        this.type = type;
        this.direction = new Vector(direction.x, direction.y);
        this.position = new Vector(position.x, position.y);
        // this.position.subtract(Vector._multiply(this.direction, .5));
        this.targetTeam = targetTeam;
        this.active = true;

        this.origin = new Vector(direction.x, direction.y);
        this.distance = 0;
    }

    render() {
        if (this.active) {
            gfx.pushMatrix();
            let offsetX = (this.position.x * tileSize - game.clients[game.localClientId].position.x * tileSize) + gfx.width / 2;
            let offsetY = (this.position.y * tileSize - game.clients[game.localClientId].position.y * tileSize) + gfx.height / 2;
            gfx.translate(offsetX, offsetY);

            // gfx.ctx.globalAlpha = 0.4;

            gfx.sprite(this.type.sprite, 0, 0, tileSize, tileSize);

            gfx.popMatrix();
        }
    }


    update() {
        this.position.subtract(Vector._multiply(this.direction, this.type.speed));

        //        if (this.active) {
        //          this.distance = this.origin.subtract(this.position).length();
        //        if (Math.sqrt(this.distance) > 40) this.active = false;

    }

    hitTest(client: Clientserverside, serverSide: boolean): boolean {
        let px: number = Math.floor(this.position.x);
        let py: number = Math.floor(this.position.y);
        if (map.data[px][py].solid) {
            this.active = false;
            return true;
        }

        if (!client.infos.dead && client.networkData.clientId != this.clientId) {
            let dist = Vector._dist(this.position, client.position);
            if (dist < .3) {
                if (serverSide) client.modLife(-this.type.dmg);
                this.active = false;
                return true;
            }
        }

        return false;
    }


}
