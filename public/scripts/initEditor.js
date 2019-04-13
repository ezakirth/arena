"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Map_1 = require("./Map/Map");
var Graphics_1 = require("./common/Graphics");
var Input_1 = require("./common/Input");
var Timer_1 = require("./common/Timer");
var EditorBundle_1 = require("./Editor/EditorBundle");
var Pickups_1 = require("./Pickups/Pickups");
window.tileSize = 96;
window.Editor = null;
window.clamp = function (num, min, max) { return Math.min(Math.max(num, min), max); };
window.gfx = new Graphics_1.default();
window.time = new Timer_1.default();
window.map = new Map_1.default();
window.input = new Input_1.default();
window.Editor = EditorBundle_1.Editor;
window.pickups = new Pickups_1.default();
var loop = function () {
    requestAnimationFrame(loop);
    window.time.update();
    // logic
    window.input.updateEditorInput();
    window.Editor.update();
    // graphics
    window.Editor.render();
};
window.gfx.init();
window.input.init();
window.Editor.init();
loop();
