"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game = /** @class */ (function () {
    function Game() {
        this.clients = {};
        this.localClientId = null;
        this.localClient = null;
    }
    Game.prototype.update = function () {
        for (var clientId in this.clients) {
            this.clients[clientId].update();
        }
    };
    Game.prototype.render = function () {
        gfx.clear();
        gfx.sprite("bg", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);
        if (this.localClient)
            this.localClient.renderLocal();
        gfx.sprite("vignette", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);
    };
    return Game;
}());
exports.default = Game;
