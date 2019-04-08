"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Map_1 = require("./common/Map");
var Graphics_1 = require("./common/Graphics");
var Input_1 = require("./common/Input");
var Timer_1 = require("./common/Timer");
var Game_1 = require("./Game/Game");
var Network_1 = require("./Game/Network");
window.tileSize = 128;
window.Editor = null;
window.clamp = function (num, min, max) { return Math.min(Math.max(num, min), max); };
window.gfx = new Graphics_1.default();
window.time = new Timer_1.default();
window.map = new Map_1.default();
window.input = new Input_1.default();
window.network = new Network_1.default();
window.game = new Game_1.default();
var loop = function () {
    requestAnimationFrame(loop);
    window.time.update();
    if (window.game.localClient) {
        // logic
        window.game.update();
        // graphics
        window.game.render();
    }
};
window.gfx.init();
window.input.init();
// attempts to connect to the server.
// once connected, server sends us the map data and our client info
window.network.init();
loop();
