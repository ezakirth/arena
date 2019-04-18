import Client from './Client';
import Vector from '../common/Vector';
import Map from '../Map/Map';
import Input from '../common/Input';
import Graphics from '../common/Graphics';
import Timer from '../common/Timer';
import Main from '../Main/Main';
import Network from '../Main/Network';
import PositionBuffer from './PositionBuffer';

declare var clamp: Function;
declare var input: Input;
declare var gfx: Graphics;
declare var time: Timer;
declare var main: Main;
declare var map: Map;
declare var network: Network;
declare var tileSize: number;



export default class ClientLocal extends Client {
    dirSide: Vector;
    canShoot: boolean;
    lastShot: number;
    constructor(name, lobbyId, clientId, team, position) {
        super(name, lobbyId, clientId, team, position);

        this.lastShot = 0;
    }

    savePositionForReconciliation() {
        this.networkData.lastPosition.set(this.position.x, this.position.y);
        this.networkData.lastDirection.set(this.direction.x, this.direction.y);
    }

    /**
     * Applies local input to the client
     */
    applyInputs() {
        if (!this.infos.dead) {






            let oldX = this.position.x;
            let oldY = this.position.y;
            let oldPx = Math.floor(this.position.x);
            let oldPy = Math.floor(this.position.y);

            // if mobile, touch controls
            if (gfx.mobile) {
                this.shooting = false;
                for (let i = 0; i < input.touches.length; i++) {
                    let touch = input.touches[i];
                    // right stick: direction
                    if (touch.origin.x > gfx.width / 2) {
                        let direction = Vector._subtract(touch.origin, touch.position);
                        this.shooting = true;

                        if (direction.length() != 0)
                            this.direction.set(direction.x, direction.y).normalize();
                    }
                    // left stick: movement
                    else {
                        if (touch.origin.x < gfx.width / 2) {
                            let direction = Vector._subtract(touch.origin, touch.position);
                            //  if (direction.length() != 0)
                            this.direction.set(direction.x, direction.y);
                            this.direction.multiply(0.025);
                            if (this.direction.length() > 1) this.direction.normalize();

                            this.position.subtract(Vector._multiply(this.direction, 0.05 * time.normalize));
                            this.moving = true;
                        }
                    }
                }
            }
            // else, use mouse+keyboard
            else {

                this.direction = Vector._subtract(new Vector(gfx.width / 2, gfx.height / 2), input.mouse.position).normalize();
                this.shooting = input.mouse.left;

                if (input.keyboard.ArrowLeft || input.keyboard.q) {
                    this.moving = true;
                    this.position.x -= this.infos.speed * time.normalize;
                }
                if (input.keyboard.ArrowRight || input.keyboard.d) {
                    this.moving = true;
                    this.position.x += this.infos.speed * time.normalize;
                }

                if (input.keyboard.ArrowUp || input.keyboard.z) {
                    this.moving = true;
                    this.position.y -= this.infos.speed * time.normalize;
                }
                if (input.keyboard.ArrowDown || input.keyboard.s) {
                    this.moving = true;
                    this.position.y += this.infos.speed * time.normalize;
                }

            }

            // new position check
            this.position.set(clamp(this.position.x, 0, map.width - 1), clamp(this.position.y, 0, map.height - 1));
            let px = Math.floor(this.position.x);
            let py = Math.floor(this.position.y);

            if (map.data[oldPx][py].solid) this.position.y = oldY;
            if (map.data[px][oldPy].solid) this.position.x = oldX;

            this.checkPortal(map.data[Math.floor(this.position.x)][Math.floor(this.position.y)]);

            // if we're trying to shoot and we're ready, shoot !
            if (this.shooting && time.elapsed > this.lastShot + this.infos.weapon.rate) {
                this.lastShot = time.elapsed
                network.shootWeapon(this);
            }

        }
    }

    /**
     * update the client position
     */
    update() {
        this.moving = false;

        // if the client is the client, update position based on input
        if (this.networkData.clientId == main.localClientId) {
            this.applyInputs();
        }
        // if the client is not the client (coming from network), interpolate its positions
        else {
            this.interpolatePositions();
        }


        if (this.moving)
            this.frame += time.delta * 6;
        else
            this.frame = 1;

        if (this.frame >= 3) this.frame = 0;
    }

    interpolatePositions() {
        // Find the two authoritative positions surrounding the rendering timestamp.
        let buffer: PositionBuffer[] = this.networkData.positionBuffer;
        if (buffer.length <= 1) return;

        // Drop positions older than 100ms.
        while (buffer[1].timestamp < time.serverRenderTimestamp) {
            buffer.shift();
        }

        let previous = buffer[0];
        let target = buffer[1];

        // Interpolate between the two surrounding authoritative positions.
        // startpoint is older than 100ms, endpoint is less than 100ms ago
        if (previous.timestamp <= time.serverRenderTimestamp && time.serverRenderTimestamp <= target.timestamp) {

            let timeFrame = (time.serverRenderTimestamp - previous.timestamp) / (target.timestamp - previous.timestamp);

            let x0 = previous.position.x;
            let y0 = previous.position.y;
            let dx0 = previous.direction.x;
            let dy0 = previous.direction.y;

            let x1 = target.position.x;
            let y1 = target.position.y;
            let dx1 = target.direction.x;
            let dy1 = target.direction.y;

            if (Vector._dist(previous.position, target.position) > 2)
                this.position.set(x1, y1);
            else
                this.position.set(x0 + (x1 - x0) * timeFrame, y0 + (y1 - y0) * timeFrame);

            this.direction.set(dx0 + (dx1 - dx0) * timeFrame, dy0 + (dy1 - dy0) * timeFrame);

            if (!(x0 == x1 && y0 == y1)) this.moving = true;
        }
    }

    /**
     * Renders the client and his view of the map
     * first map pass renders the floor, decals, spawn and portals
     * second map pass renders walls, shadows and pickups
     */
    renderLocal() {
        // first pass
        map.renderView(this.position, 1);

        this.renderCharacter();

        for (let projectile of main.projectiles) {
            projectile.render();
        }

        // render network clients
        for (let clientId in main.clients) {
            if (clientId != main.localClientId) {
                main.clients[clientId].renderNetworkClientCharacter();
            }
        }
        // second pass
        map.renderView(this.position, 2);

        this.renderStats();

        // render network clients' stats
        for (let clientId in main.clients) {
            if (clientId != main.localClientId) {
                main.clients[clientId].renderNetworkClientStats();
            }
        }

    }

    renderNetworkClientCharacter() {

        gfx.pushMatrix();
        let offsetX = (this.position.x * tileSize - main.clients[main.localClientId].position.x * tileSize);
        let offsetY = (this.position.y * tileSize - main.clients[main.localClientId].position.y * tileSize);
        gfx.translate(offsetX, offsetY);

        this.renderCharacter();
        gfx.popMatrix();
    }


    renderNetworkClientStats() {
        gfx.pushMatrix();
        let offsetX = (this.position.x * tileSize - main.clients[main.localClientId].position.x * tileSize);
        let offsetY = (this.position.y * tileSize - main.clients[main.localClientId].position.y * tileSize);
        gfx.translate(offsetX, offsetY);

        this.renderStats();
        gfx.popMatrix();
    }
    /**
     * Displays the character
     */
    renderCharacter() {
        let ang = Math.atan2(this.direction.y, this.direction.x);

        gfx.pushMatrix();
        gfx.translate(gfx.width / 2, gfx.height / 2);
        gfx.rotate(ang - Math.PI / 2);
        gfx.sprite("shadow", 0, 0, tileSize, tileSize);
        if (this.infos.dead) gfx.ctx.globalAlpha = 0.4;
        gfx.spriteSheet("toon_" + this.infos.team, 320 / 3 * Math.floor(this.frame), 0, 320 / 3, 210, 0, 0, tileSize * ((320 / 3) / 210), tileSize);
        gfx.popMatrix();
    }

    /**
     * Displays all the client stats (name, life, shield)
     */
    renderStats() {
        let lifeVal: number = 100;
        let life: number = (tileSize / 2) / 100 * this.infos.life + 0.1;
        let shield: number = (tileSize / 2) / 100 * this.infos.shield + 0.1;
        if (this.infos.life < 100) lifeVal = 75;
        if (this.infos.life < 75) lifeVal = 50;
        if (this.infos.life < 50) lifeVal = 25;
        if (this.infos.life < 25) lifeVal = 0;

        gfx.pushMatrix();
        gfx.translate(gfx.width / 2, gfx.height / 2);
        if (this.infos.dead) {
            gfx.drawText(this.name + ' (Dead, respawn in ' + this.infos.respawnTime.toFixed(1) + 's)', 0, -68);
        }
        else {
            gfx.sprite('stat_life_' + lifeVal, 0, -55, life, 8);
            gfx.sprite('stat_shield', 0, -45, shield, 8);
            gfx.drawText(this.name, 0, -68);
        }
        gfx.popMatrix();
    }

}
