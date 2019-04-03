"use strict";
var tileSize = 96;
var Game, Editor, map = new Map(), time = new Timer(), gfx = new Graphics();
function init() {
    gfx.init();
    Editor.init();
    Input.init();
    loop();

}

/**
 * Game loop
 */
function loop() {
    requestAnimationFrame(loop);
    time.update();

    // logic
    Input.update();
    Editor.update();

    // graphics
    Editor.render();
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
