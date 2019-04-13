
import Map from './Map/Map';
import Graphics from './common/Graphics';
import Input from './common/Input';
import Timer from './common/Timer';
import Main from './Main/Main';
import Network from './Main/Network';
import Pickups from './Pickups/Pickups';
import HUD from './Main/HUD';

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
window.hud = new HUD();


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

        window.hud.render();
    }
}


window.gfx.init();
window.input.init();

/**
As soon as the app starts, we (the client) try to connect to the server.
Once connected, server messages us 'welcome' along with our unique client id and a list of all lobbies and available maps.
We chose a name then join or create a game my messaging back 'askToJoin' a long with our name and the lobby and map we wish to join/create
Server creates the lobby/map (if needed) then assigns us to a blue or green team and a spawn point. It messages us back 'acceptJoin' along with our player info and the map data.
We finally load this information locally and start the main game loop
*/
window.network.connect();
