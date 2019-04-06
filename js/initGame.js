// browserify initGame.js -o bundleGame.js

var Network = require('./Game/Network');
var Game = require('./Game/Game');
var Map = require('./common/Map');
var Graphics = require('./common/Graphics');
var Input = require('./common/Input');
var Pickups = require('./common/Pickups');
var Timer = require('./common/Timer');


window.tileSize = 128;
window.Editor = null;


window.gfx = new Graphics();
window.time = new Timer();
window.map = new Map();
window.input = new Input();
window.network = new Network();
window.game = new Game();

Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};


window.loop = function () {
    requestAnimationFrame(loop);
    time.update();

    if (game.localClient) {
        // logic
        game.update();
        // graphics
        game.render();
    }
}


gfx.init();
input.init();

// attempts to connect to the server.
// once connected, server sends us the map data and our client info 
network.init();

loop();
