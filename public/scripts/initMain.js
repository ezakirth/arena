"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Map_1 = require("./Map/Map");
var Graphics_1 = require("./common/Graphics");
var Input_1 = require("./common/Input");
var Timer_1 = require("./common/Timer");
var Main_1 = require("./Main/Main");
var Network_1 = require("./Main/Network");
var Pickups_1 = require("./Pickups/Pickups");
window.tileSize = 128;
window.Editor = null;
window.clamp = function (num, min, max) { return Math.min(Math.max(num, min), max); };
window.gfx = new Graphics_1.default();
window.time = new Timer_1.default();
window.map = new Map_1.default();
window.input = new Input_1.default();
window.network = new Network_1.default();
window.main = new Main_1.default();
window.pickups = new Pickups_1.default();
window.loop = function () {
    requestAnimationFrame(loop);
    window.time.update();
    if (window.main.localClient) {
        // graphics
        window.main.render();
        window.input.drawTouch();
        // logic
        window.main.update();
        window.input.update();
    }
};
window.gfx.init();
window.input.init();
// attempts to connect to the server.
// once connected, server sends us the map data and our client info
window.network.init();
