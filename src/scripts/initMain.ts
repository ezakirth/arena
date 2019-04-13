
import Map from './Map/Map';
import Graphics from './common/Graphics';
import Input from './common/Input';
import Timer from './common/Timer';
import Main from './Main/Main';
import Network from './Main/Network';
import Pickups from './Pickups/Pickups';


declare var window: any;
declare var loop: any;

window.tileSize = 128;
window.Editor = null;

window.clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);
window.gfx = new Graphics();
window.time = new Timer();
window.map = new Map();
window.input = new Input();
window.network = new Network();
window.main = new Main();
window.pickups = new Pickups();



window.loop = function () {
    requestAnimationFrame(loop);
    window.time.update();

    if (window.main.localClient) {
        // graphics
        window.main.render();
        window.input.drawTouch();


        // logic
        window.main.update();
        window.input.update();
    }
}


window.gfx.init();
window.input.init();

// attempts to connect to the server.
// once connected, server sends us the map data and our client info
window.network.init();
