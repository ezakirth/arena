"use strict";
var tileSize = 128;
var solo = true;
var Game, Editor;
function init() {
    gfx.init();

    Game.init();
    Input.init();
    loop();

}

function loop() {
    requestAnimationFrame(loop);

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
