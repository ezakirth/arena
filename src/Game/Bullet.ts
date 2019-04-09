import Vector from '../common/Vector';
import { Pickups } from '../common/Pickups';
import Game from './Game';
import Timer from '../common/Timer';
import Graphics from '../common/Graphics';

declare var game: Game;
declare var gfx: Graphics;

declare var tileSize: number;
declare var time: Timer;
/**
 * Handles a bullet
 */
export default class Bullet {
    direction: Vector;
    position: Vector;
    team: string;
    type: string;

    speed: number;
    constructor(team, position, direction) {
        this.direction = new Vector(direction.x, direction.y);
        this.position = new Vector(position.x, position.y);
        this.position.subtract(Vector._multiply(this.direction, .5));
        this.team = team;
        this.speed = .1;
    }

    update() {
        this.position.subtract(Vector._multiply(this.direction, this.speed));
    }

    render() {
        gfx.pushMatrix();
        let offsetX = (this.position.x * tileSize - game.clients[game.localClientId].position.x * tileSize);
        let offsetY = (this.position.y * tileSize - game.clients[game.localClientId].position.y * tileSize);
        gfx.translate(offsetX, offsetY);

        gfx.pushMatrix();
        gfx.translate(gfx.width / 2, gfx.height / 2);

        gfx.sprite('bullet', 0, 0, 32, 32);

        gfx.popMatrix();
        gfx.popMatrix();
    }
}
