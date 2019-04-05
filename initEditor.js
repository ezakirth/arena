// browserify initEditor.js -o bundleEditor.js

var Map = require('./js/common/Map');
var Graphics = require('./js/common/Graphics');
var Input = require('./js/common/Input');
var Timer = require('./js/common/Timer');
var Editor = require('./js/Editor/EditorBundle');


window.gfx = new Graphics();
window.time = new Timer();
window.map = new Map();
window.input = new Input();
window.tileSize = 96;

Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};


/**
 * Game loop
 */
window.loop = function () {
    requestAnimationFrame(loop);
    time.update();

    // logic
    input.update();
    Editor.update();

    // graphics
    Editor.render();
}

gfx.init();
Editor.init();
input.init();
loop();