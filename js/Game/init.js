"use strict";
var tileSize = 128;
var Editor;
var game = new Game(false); // true if multiplayer
var map = new Map();
var time = new Timer();
var gfx = new Graphics();
var network = new Network();
var input = new Input();


function init() {
    gfx.init();

    input.init();

    // load map, call loop when ready
    map.setupGame(loop);
    game.init();
}

/**
 * Game loop
 */
function loop() {
    requestAnimationFrame(loop);
    time.update();
    // logic
    game.update();
    // graphics
    game.render();
}
