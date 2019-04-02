"use strict";
var tileSize = 128;
var nbPlayers = 1;
var Game, Editor, map, timer;
function init() {
    gfx.init();

    timer = new Timer();
    map = new Map();

    Game.init();
    Input.init();
    loop();

}

/** 
 * Game loop
 */
function loop() {
    requestAnimationFrame(loop);
    timer.update();

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
