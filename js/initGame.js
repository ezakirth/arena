// browserify initGame.js -o bundleGame.js

var Network = require('./Game/Network');
var Game = require('./Game/Game');
var Map = require('./common/Map');
var Graphics = require('./common/Graphics');
var Input = require('./common/Input');
var Pickups = require('./Game/Pickups');
var Timer = require('./common/Timer');
var Menu = require('./common/Menu');



window.tileSize = 128;
window.Editor = null;



window.gfx = new Graphics();
window.time = new Timer();
window.map = new Map();
window.input = new Input();
window.network = new Network();
window.game = new Game();
window.menu = new Menu();

Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};


window.loop = function () {
    requestAnimationFrame(loop);
    time.update();
    // logic
    game.update();
    // graphics
    game.render();
}


gfx.init();
input.init();

// attempts to connect to the server.
// once connected, server sends us the map data and our client info 
network.init(loop);

