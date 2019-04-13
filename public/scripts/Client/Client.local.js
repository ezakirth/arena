"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Client_1 = require("./Client");
var Vector_1 = require("../common/Vector");
var ClientLocal = /** @class */ (function (_super) {
    __extends(ClientLocal, _super);
    function ClientLocal(name, lobbyId, clientId, team, position) {
        var _this = _super.call(this, name, lobbyId, clientId, team, position) || this;
        _this.lastShot = 0;
        return _this;
    }
    ClientLocal.prototype.savePositionForReconciliation = function () {
        this.networkData.lastPosition.set(this.position.x, this.position.y);
        this.networkData.lastDirection.set(this.direction.x, this.direction.y);
    };
    /**
     * Applies local input to the client
     */
    ClientLocal.prototype.applyInputs = function () {
        if (!this.infos.dead) {
            var oldX = this.position.x;
            var oldY = this.position.y;
            var oldPx = Math.floor(this.position.x);
            var oldPy = Math.floor(this.position.y);
            // if mobile, touch controls
            if (gfx.mobile) {
                this.shooting = false;
                for (var i = 0; i < input.touches.length; i++) {
                    var touch = input.touches[i];
                    // right stick: direction
                    if (touch.origin.x > gfx.width / 2) {
                        var direction = Vector_1.default._subtract(touch.origin, touch.position);
                        this.shooting = true;
                        if (direction.length() != 0)
                            this.direction.set(direction.x, direction.y).normalize();
                    }
                    // left stick: movement
                    else {
                        if (touch.origin.x < gfx.width / 2) {
                            var direction = Vector_1.default._subtract(touch.origin, touch.position).normalize();
                            this.position.subtract(direction.multiply(0.05 * time.normalize));
                            this.moving = true;
                        }
                    }
                }
            }
            // else, use mouse+keyboard
            else {
                this.direction = Vector_1.default._subtract(new Vector_1.default(gfx.width / 2, gfx.height / 2), input.mouse.position).normalize();
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
            var px = Math.floor(this.position.x);
            var py = Math.floor(this.position.y);
            if (map.data[oldPx][py].solid)
                this.position.y = oldY;
            if (map.data[px][oldPy].solid)
                this.position.x = oldX;
            // if we're trying to shoot and we're ready, shoot !
            if (this.shooting && time.elapsed > this.lastShot + this.infos.weapon.rate) {
                this.lastShot = time.elapsed;
                network.shootWeapon(this);
            }
        }
    };
    /**
     * update the client position
     */
    ClientLocal.prototype.update = function () {
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
        if (this.frame >= 3)
            this.frame = 0;
    };
    ClientLocal.prototype.interpolatePositions = function () {
        // Find the two authoritative positions surrounding the rendering timestamp.
        var buffer = this.networkData.positionBuffer;
        // Drop positions older than 100ms.
        while (buffer.length >= 2 && buffer[1].timestamp <= time.serverRenderTimestamp) {
            buffer.shift();
        }
        // Interpolate between the two surrounding authoritative positions.
        // startpoint is older than 100ms, endpoint is less than 100ms ago
        if (buffer.length >= 2 && buffer[0].timestamp <= time.serverRenderTimestamp && buffer[1].timestamp >= time.serverRenderTimestamp) {
            var x0 = buffer[0].position.x;
            var y0 = buffer[0].position.y;
            var dx0 = buffer[0].direction.x;
            var dy0 = buffer[0].direction.y;
            var t0 = buffer[0].timestamp;
            var x1 = buffer[1].position.x;
            var y1 = buffer[1].position.y;
            var dx1 = buffer[1].direction.x;
            var dy1 = buffer[1].direction.y;
            var t1 = buffer[1].timestamp;
            this.position.set(x0 + (x1 - x0) * (time.serverRenderTimestamp - t0) / (t1 - t0), y0 + (y1 - y0) * (time.serverRenderTimestamp - t0) / (t1 - t0));
            this.direction.set(dx0 + (dx1 - dx0) * (time.serverRenderTimestamp - t0) / (t1 - t0), dy0 + (dy1 - dy0) * (time.serverRenderTimestamp - t0) / (t1 - t0));
            if (!(x0 == x1 && y0 == y1))
                this.moving = true;
        }
    };
    /**
     * Renders the client and his view of the map
     * first map pass renders the floor, decals, spawn and portals
     * second map pass renders walls, shadows and pickups
     */
    ClientLocal.prototype.renderLocal = function () {
        // first pass
        map.renderView(this.position, 1);
        this.renderCharacter();
        for (var _i = 0, _a = main.projectiles; _i < _a.length; _i++) {
            var projectile = _a[_i];
            projectile.render();
        }
        // render network clients
        for (var clientId in main.clients) {
            if (clientId != main.localClientId) {
                main.clients[clientId].renderNetworkClientCharacter();
            }
        }
        // second pass
        map.renderView(this.position, 2);
        this.renderStats();
        // render network clients' stats
        for (var clientId in main.clients) {
            if (clientId != main.localClientId) {
                main.clients[clientId].renderNetworkClientStats();
            }
        }
    };
    ClientLocal.prototype.renderNetworkClientCharacter = function () {
        gfx.pushMatrix();
        var offsetX = (this.position.x * tileSize - main.clients[main.localClientId].position.x * tileSize);
        var offsetY = (this.position.y * tileSize - main.clients[main.localClientId].position.y * tileSize);
        gfx.translate(offsetX, offsetY);
        this.renderCharacter();
        gfx.popMatrix();
    };
    ClientLocal.prototype.renderNetworkClientStats = function () {
        gfx.pushMatrix();
        var offsetX = (this.position.x * tileSize - main.clients[main.localClientId].position.x * tileSize);
        var offsetY = (this.position.y * tileSize - main.clients[main.localClientId].position.y * tileSize);
        gfx.translate(offsetX, offsetY);
        this.renderStats();
        gfx.popMatrix();
    };
    /**
     * Displays the character
     */
    ClientLocal.prototype.renderCharacter = function () {
        var ang = Math.atan2(this.direction.y, this.direction.x);
        gfx.pushMatrix();
        gfx.translate(gfx.width / 2, gfx.height / 2);
        gfx.rotate(ang - Math.PI / 2);
        gfx.sprite("shadow", 0, 0, tileSize, tileSize);
        if (this.infos.dead)
            gfx.ctx.globalAlpha = 0.4;
        gfx.spriteSheet("toon_" + this.infos.team, 320 / 3 * Math.floor(this.frame), 0, 320 / 3, 210, 0, 0, tileSize * ((320 / 3) / 210), tileSize);
        gfx.popMatrix();
    };
    /**
     * Displays all the client stats (name, life, shield)
     */
    ClientLocal.prototype.renderStats = function () {
        var lifeVal = 100;
        var life = (tileSize / 2) / 100 * this.infos.life + 0.1;
        var shield = (tileSize / 2) / 100 * this.infos.shield + 0.1;
        if (this.infos.life < 100)
            lifeVal = 75;
        if (this.infos.life < 75)
            lifeVal = 50;
        if (this.infos.life < 50)
            lifeVal = 25;
        if (this.infos.life < 25)
            lifeVal = 0;
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
    };
    return ClientLocal;
}(Client_1.default));
exports.default = ClientLocal;
