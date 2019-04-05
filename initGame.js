// browserify initGame.js -o bundleGame.js

var Network = require('./js/Game/Network');
var Game = require('./js/Game/Game');
var Map = require('./js/common/Map');
var Graphics = require('./js/common/Graphics');
var Input = require('./js/common/Input');
var Pickups = require('./js/common/Pickups');
var Timer = require('./js/common/Timer');


window.gfx = new Graphics();
window.time = new Timer();
window.map = new Map();
window.input = new Input();
window.network = new Network();
window.game = new Game();
window.tileSize = 128;
window.Editor = null;


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

