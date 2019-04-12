import Vector from '../common/Vector';
import Pickups from '../Pickups/Pickups';
import Main from './Main';
import Map from '../Map/Map';
import Timer from '../common/Timer';
import Graphics from '../common/Graphics';
import Client from '../Client/Client';
import Server from '../server/Server';
import ClientServer from '../Client/Client.server';
import Weapon from '../Pickups/Weapon';

declare var main: Main;
declare var map: Map;
declare var gfx: Graphics;
declare var pickups: Pickups;

declare var tileSize: number;
declare var time: Timer;
declare var server: Server;
/**
 * Handles a projectile
 */
export default class Projectile {
    direction: Vector;
    position: Vector;
    type: Weapon;
    origin: Vector;
    distance: number;
    targetTeam: string;
    active: boolean;
    lobbyId: string;
    clientId: string;
    speed: number;
    curve: number;
    constructor(lobbyId: string, clientId: string, targetTeam: string, position: Vector, direction: Vector, type: Weapon) {
        this.lobbyId = lobbyId;
        this.clientId = clientId;
        this.type = type;
        this.direction = new Vector(direction.x, direction.y);
        this.position = new Vector(position.x, position.y);
        // this.position.subtract(Vector._multiply(this.direction, .5));
        this.targetTeam = targetTeam;
        this.active = true;

        this.origin = new Vector(direction.x, direction.y);
        this.distance = 0;
        this.curve = 1;
    }

    render() {
        if (this.active) {
            gfx.pushMatrix();
            let offsetX = (this.position.x * tileSize - main.clients[main.localClientId].position.x * tileSize) + gfx.width / 2;
            let offsetY = (this.position.y * tileSize - main.clients[main.localClientId].position.y * tileSize) + gfx.height / 2;
            gfx.translate(offsetX, offsetY);

            gfx.ctx.globalAlpha = this.curve;

            gfx.sprite(this.type.sprite, 0, 0, tileSize, tileSize);

            gfx.popMatrix();
        }
    }


    update() {
        this.curve = (this.type.range - this.distance);
        if (this.curve > 1) this.curve = 1;
        this.position.subtract(Vector._multiply(this.direction, (this.type.speed * time.normalize) * this.curve));

        this.distance += time.delta;
        if (this.distance > this.type.range)
            this.active = false;

    }

    hitTest(client: any, serverSide: boolean): boolean {
        let px: number = Math.floor(this.position.x);
        let py: number = Math.floor(this.position.y);

        let next: Vector = Vector._subtract(this.position, Vector._multiply(this.direction, this.type.speed * time.normalize));
        let npx: number = Math.floor(next.x);
        let npy: number = Math.floor(next.y);

        let _map = null;

        if (serverSide)
            _map = server.lobbies[this.lobbyId].map;
        else
            _map = map;

        if (_map.data[npx][py].solid) {
            if (this.type.bouncy) {
                this.direction.x *= -1;
            }
            else {
                this.active = false;
                return true;
            }
        }
        if (_map.data[px][npy].solid) {
            if (this.type.bouncy) {
                this.direction.y *= -1;
            }
            else {
                this.active = false;
                return true;
            }
        }



        if (!client.infos.dead && (this.targetTeam == client.infos.team || this.targetTeam == 'any') && client.networkData.clientId != this.clientId) {
            let dist = Vector._dist(this.position, client.position);
            if (dist < .3) {
                if (serverSide) {
                    client.modLife(-this.type.dmg);
                }
                this.active = false;
                return true;
            }
        }

        return false;
    }


}
