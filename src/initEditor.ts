export const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);

import Map from './common/Map';
import Graphics from './common/Graphics';
import Input from './common/Input';
import Timer from './common/Timer';
import { Editor } from './Editor/EditorBundle';


export const tileSize: number = 96;

export const gfx: Graphics = new Graphics();
export const time: Timer = new Timer();
export const map = new Map();
export const input = new Input();


/**
 * Game loop
 */
var loop = function () {
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
