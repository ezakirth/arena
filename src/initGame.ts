
import Map from './common/Map';
import Graphics from './common/Graphics';
import Input from './common/Input';
import Timer from './common/Timer';
import Game from './Game/Game';
import Network from './Game/Network';


declare var window: any;

window.tileSize = 128;
window.Editor = null;

window.clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);
window.gfx = new Graphics();
window.time = new Timer();
window.map = new Map();
window.input = new Input();
window.network = new Network();
window.game = new Game();



var loop = function () {
    requestAnimationFrame(loop);
    window.time.update();

    if (window.game.localClient) {
        // graphics
        window.game.render();
        // logic
        window.game.update();
    }
}


window.gfx.init();
window.input.init();

// attempts to connect to the server.
// once connected, server sends us the map data and our client info
window.network.init();

loop();
