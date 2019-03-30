"use strict";

var solo = false;
var Game;
function init() {
    Graphics.init();

    Game.init();
    Input.init();
    loop();

}

function loop() {
    // logic
    Game.update();

    // graphics
    Game.render();

    requestAnimationFrame(loop);
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
