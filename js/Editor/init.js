"use strict";
var tileSize = 96;

var Editor;
var map = new Map();
var time = new Timer();
var gfx = new Graphics();
var input = new Input();


function init() {
    gfx.init();
    Editor.init();
    input.init();
    loop();
}

/**
 * Game loop
 */
function loop() {
    requestAnimationFrame(loop);
    time.update();

    // logic
    input.update();
    Editor.update();

    // graphics
    Editor.render();
}
