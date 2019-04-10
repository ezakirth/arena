
import Map from './common/Map';
import Graphics from './common/Graphics';
import Input from './common/Input';
import Timer from './common/Timer';
import { Editor } from './Editor/EditorBundle';
import Pickups from './common/Pickups';


declare var window: any;

window.tileSize = 96;
window.Editor = null;

window.clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);
window.gfx = new Graphics();
window.time = new Timer();
window.map = new Map();
window.input = new Input();
window.Editor = Editor;
window.pickups = new Pickups();



var loop = function () {
    requestAnimationFrame(loop);
    window.time.update();
    // logic
    window.input.update();
    window.Editor.update();
    // graphics
    window.Editor.render();

}


window.gfx.init();
window.input.init();

window.Editor.init();

loop();
