"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Menu_1 = require("./Menu");
var Main = /** @class */ (function () {
    function Main() {
        this.clients = {};
        this.projectiles = [];
        this.lobbies = [];
        this.localClientId = null;
        this.localClient = null;
        this.localClientName = null;
        this.lobbyId = null;
        this.menu = new Menu_1.default();
        this.tiles = 0;
    }
    Main.prototype.render = function () {
        gfx.clear();
        gfx.sprite("bg", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);
        this.tiles = 0;
        if (this.localClient)
            this.localClient.renderLocal();
        gfx.sprite("vignette", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);
    };
    Main.prototype.update = function () {
        for (var clientId in this.clients) {
            this.clients[clientId].update();
        }
        for (var index = this.projectiles.length - 1; index >= 0; index--) {
            var projectile = this.projectiles[index];
            if (projectile.active) {
                projectile.update();
                for (var clientId in this.clients) {
                    var client = this.clients[clientId];
                    if (projectile.hitTest(client, false))
                        break;
                }
            }
            else {
                this.projectiles.splice(index, 1);
            }
        }
    };
    return Main;
}());
exports.default = Main;
