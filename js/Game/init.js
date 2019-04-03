"use strict";
var tileSize = 128;
var Game, Editor, map = new Map(), time = new Timer(), gfx = new Graphics(), network = new Network();
function init() {
    gfx.init();

    Input.init();

    // load map, call loop when ready
    map.setupGame(loop);
    Game.init();
}

/**
 * Game loop
 */
function loop() {
    requestAnimationFrame(loop);
    time.update();
    // logic
    Game.update();
    // graphics
    Game.render();
}


(function () {
    var script = document.createElement('script');
    script.onload = function () {
        var stats = new Stats();
        document.body.appendChild(stats.dom);
        requestAnimationFrame(function loop() {
            stats.update();
            requestAnimationFrame(loop)
        });
    };
    script.src = 'lib/stats.js';
    document.head.appendChild(script);
})()
