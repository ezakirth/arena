"use strict";

var Editor;
function init() {
    gfx.init();

    Editor.init();
    Input.init();
    loop();

}

function loop() {
    requestAnimationFrame(loop);

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
