"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Map_1 = require("./Map/Map");
var Graphics_1 = require("./common/Graphics");
var Input_1 = require("./common/Input");
var Timer_1 = require("./common/Timer");
var Main_1 = require("./Main/Main");
var Network_1 = require("./Main/Network");
var Pickups_1 = require("./Pickups/Pickups");
var HUD_1 = require("./Main/HUD");
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
window.hud = new HUD_1.default();
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
        window.hud.render();
    }
};
window.gfx.init();
window.input.init();
/**
As soon as the app starts, we (the client) try to connect to the server.
Once connected, server messages us 'welcome' along with our unique client id and a list of all lobbies and available maps.
We chose a name then join or create a game my messaging back 'askToJoin' a long with our name and the lobby and map we wish to join/create
Server creates the lobby/map (if needed) then assigns us to a blue or green team and a spawn point. It messages us back 'acceptJoin' along with our player info and the map data.
We finally load this information locally and start the main game loop
*/
window.network.connect();
