"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector_1 = require("../common/Vector");
/**
 * Handles a projectile
 */
var Projectile = /** @class */ (function () {
    function Projectile(lobbyId, clientId, targetTeam, position, direction, type) {
        this.lobbyId = lobbyId;
        this.clientId = clientId;
        this.type = type;
        this.direction = new Vector_1.default(direction.x, direction.y);
        this.position = new Vector_1.default(position.x, position.y);
        // this.position.subtract(Vector._multiply(this.direction, .5));
        this.targetTeam = targetTeam;
        this.active = true;
        this.origin = new Vector_1.default(direction.x, direction.y);
        this.distance = 0;
        this.curve = 1;
    }
    Projectile.prototype.render = function () {
        if (this.active) {
            gfx.pushMatrix();
            var offsetX = (this.position.x * tileSize - main.clients[main.localClientId].position.x * tileSize) + gfx.width / 2;
            var offsetY = (this.position.y * tileSize - main.clients[main.localClientId].position.y * tileSize) + gfx.height / 2;
            gfx.translate(offsetX, offsetY);
            gfx.ctx.globalAlpha = this.curve;
            gfx.sprite(this.type.sprite, 0, 0, tileSize, tileSize);
            gfx.popMatrix();
        }
    };
    Projectile.prototype.update = function () {
        this.curve = (this.type.range - this.distance);
        if (this.curve > 1)
            this.curve = 1;
        this.position.subtract(Vector_1.default._multiply(this.direction, (this.type.speed * time.normalize) * this.curve));
        this.distance += time.delta;
        if (this.distance > this.type.range)
            this.active = false;
    };
    Projectile.prototype.hitTest = function (client, serverSide) {
        var px = Math.floor(this.position.x);
        var py = Math.floor(this.position.y);
        var next = Vector_1.default._subtract(this.position, Vector_1.default._multiply(this.direction, this.type.speed * time.normalize));
        var npx = Math.floor(next.x);
        var npy = Math.floor(next.y);
        var _map = null;
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
            var dist = Vector_1.default._dist(this.position, client.position);
            if (dist < .3) {
                if (serverSide) {
                    client.modLife(-this.type.dmg);
                }
                this.active = false;
                return true;
            }
        }
        return false;
    };
    return Projectile;
}());
exports.default = Projectile;
