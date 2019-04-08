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
var Clientclientside = /** @class */ (function (_super) {
    __extends(Clientclientside, _super);
    function Clientclientside(name, clientId, team, position) {
        return _super.call(this, name, clientId, team, position) || this;
    }
    /**
     * Applies local input to the client
     */
    Clientclientside.prototype.applyInputs = function () {
        if (!this.dead) {
            this.direction = Vector_1.default._subtract(new Vector_1.default(gfx.width / 2, gfx.height / 2), new Vector_1.default(input.mouse.x, input.mouse.y)).normalize();
            this.dirSide = Vector_1.default._rotate(this.direction, Math.PI / 2);
            var oldX = this.position.x;
            var oldY = this.position.y;
            var oldPx = Math.floor(this.position.x);
            var oldPy = Math.floor(this.position.y);
            if (input.keyboard.ArrowLeft) {
                this.moving = true;
                this.position.add(this.dirSide.multiply(this.infos.speed));
            }
            if (input.keyboard.ArrowRight) {
                this.moving = true;
                this.position.subtract(this.dirSide.multiply(this.infos.speed));
            }
            if (input.keyboard.ArrowUp) {
                this.moving = true;
                this.position.subtract(this.direction.multiply(this.infos.speed));
            }
            if (input.keyboard.ArrowDown) {
                this.moving = true;
                this.position.add(this.direction.multiply(this.infos.speed));
            }
            this.position.x = clamp(this.position.x, 0, map.w - 1);
            this.position.y = clamp(this.position.y, 0, map.h - 1);
            var px = Math.floor(this.position.x);
            var py = Math.floor(this.position.y);
            if (map.data[oldPx][py].solid)
                this.position.y = oldY;
            if (map.data[px][oldPy].solid)
                this.position.x = oldX;
        }
    };
    /**
     * update the client position
     */
    Clientclientside.prototype.update = function () {
        this.moving = false;
        // if the client is the client, update position based on input
        if (this.networkData.clientId == game.localClientId) {
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
    Clientclientside.prototype.interpolatePositions = function () {
        // Find the two authoritative positions surrounding the rendering timestamp.
        var buffer = this.networkData.positionBuffer;
        // Drop positions older than 100ms.
        while (buffer.length >= 2 && buffer[1].timestamp <= time.networkData.renderTimestamp) {
            buffer.shift();
        }
        // Interpolate between the two surrounding authoritative positions.
        // startpoint is older than 100ms, endpoint is less than 100ms ago
        if (buffer.length >= 2 && buffer[0].timestamp <= time.networkData.renderTimestamp && buffer[1].timestamp >= time.networkData.renderTimestamp) {
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
            this.position.x = x0 + (x1 - x0) * (time.networkData.renderTimestamp - t0) / (t1 - t0);
            this.position.y = y0 + (y1 - y0) * (time.networkData.renderTimestamp - t0) / (t1 - t0);
            this.direction.x = dx0 + (dx1 - dx0) * (time.networkData.renderTimestamp - t0) / (t1 - t0);
            this.direction.y = dy0 + (dy1 - dy0) * (time.networkData.renderTimestamp - t0) / (t1 - t0);
            if (!(x0 == x1 && y0 == y1))
                this.moving = true;
        }
    };
    /**
     * Kills the client (drops flag if he was carrying)
     */
    Clientclientside.prototype.die = function () {
        if (this.infos.hasEnemyFlag) {
            var px = Math.floor(this.position.x);
            var py = Math.floor(this.position.y);
            map.queueUpdate('pickup', 'pickup_flag_' + this.infos.enemyTeam, px, py);
            this.infos.hasEnemyFlag = false;
        }
        this.dead = true;
    };
    /**
     * Renders the client and his view of the map
     * first map pass renders the floor, decals, spawn and portals
     * second map pass renders walls, shadows and pickups
     */
    Clientclientside.prototype.renderLocal = function () {
        // first pass
        map.renderView(this.position, 1);
        this.renderCharacter();
        // render network clients
        for (var clientId in game.clients) {
            if (clientId != game.localClientId) {
                game.clients[clientId].renderNetworkClientCharacter();
            }
        }
        // second pass
        map.renderView(this.position, 2);
        this.renderStats();
        // render network clients' stats
        for (var clientId in game.clients) {
            if (clientId != game.localClientId) {
                game.clients[clientId].renderNetworkClientStats();
            }
        }
    };
    Clientclientside.prototype.renderNetworkClientCharacter = function () {
        gfx.pushMatrix();
        var offsetX = (this.position.x * tileSize - game.clients[game.localClientId].position.x * tileSize);
        var offsetY = (this.position.y * tileSize - game.clients[game.localClientId].position.y * tileSize);
        gfx.translate(offsetX, offsetY);
        this.renderCharacter();
        gfx.popMatrix();
    };
    Clientclientside.prototype.renderNetworkClientStats = function () {
        gfx.pushMatrix();
        var offsetX = (this.position.x * tileSize - game.clients[game.localClientId].position.x * tileSize);
        var offsetY = (this.position.y * tileSize - game.clients[game.localClientId].position.y * tileSize);
        gfx.translate(offsetX, offsetY);
        this.renderStats();
        gfx.popMatrix();
    };
    /**
     * Displays the character
     */
    Clientclientside.prototype.renderCharacter = function () {
        var ang = Math.atan2(this.direction.y, this.direction.x);
        gfx.pushMatrix();
        gfx.translate(gfx.width / 2, gfx.height / 2);
        gfx.rotate(ang - Math.PI / 2);
        gfx.sprite("shadow", 0, 0, tileSize, tileSize);
        gfx.spriteSheet("toon_" + this.infos.team, 320 / 3 * Math.floor(this.frame), 0, 320 / 3, 210, 0, 0, tileSize * ((320 / 3) / 210), tileSize);
        gfx.popMatrix();
    };
    /**
     * Displays all the client stats (name, life, shield)
     */
    Clientclientside.prototype.renderStats = function () {
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
        gfx.sprite('stat_life_' + lifeVal, 0, -55, life, 8);
        gfx.sprite('stat_shield', 0, -45, shield, 8);
        gfx.drawText(this.infos.name, 0, -68);
        gfx.popMatrix();
    };
    return Clientclientside;
}(Client_1.default));
exports.default = Clientclientside;
