import Vector from './Vector';
import Tile from './Tile';
import Timer from './Timer';
import Graphics from './Graphics';

declare var time: Timer;
declare var gfx: Graphics;
declare var tileSize: number;
declare var Editor: any;

export default class Map {
    w: number;
    h: number;
    data: Array<Array<Tile>>;
    spawns: any;
    flags: any;
    updates: Array<any>;
    constructor() {

        this.data = null;
        this.spawns = { blue: [], green: [] };
        this.flags = { blue: null, green: null };

        // updates from server that are to be processed
        this.updates = [];
    }

    /**
     * Sets up the map in editor mode
     * @param w
     * @param h
     * @param forceNew
     */
    init(w: number, h: number, forceNew: boolean) {
        this.w = w;
        this.h = h;

        this.data = JSON.parse(localStorage.getItem('tileData'));
        if (!this.data || forceNew) {
            this.data = Array(this.w);
            for (var x: number = 0; x < this.w; x++) {
                this.data[x] = Array(this.h);
                for (var y: number = 0; y < this.h; y++) {
                    this.data[x][y] = new Tile();
                }
            }
        }
        this.w = this.data.length;
        this.h = this.data[0].length;

        document.getElementById("editor_Width_id")['value'] = this.w;
        document.getElementById("editor_Height_id")['value'] = this.h;
    }

    /**
     * Server method: adds an update to the queue
     * @param type
     * @param value
     * @param x
     * @param y
     */

    queueUpdate(type: string, value: any, x: number, y: number) {
        this.updates.push({ type: type, value: value, x: x, y: y });
    }

    /**
     * Client method: processes the update queue
     */
    processUpdates() {
        for (let update of this.updates) {
            let tile = this.data[update.x][update.y];
            tile[update.type] = update.value;
        }

        this.updates = [];
    }

    /**
     * Pick a random spawn point for a client
     * @param {string} team
     */
    assignSpawnToClient(team: string) {
        let spawnPoint = this.spawns[team][Math.floor(Math.random() * this.spawns[team].length)];

        return new Vector(spawnPoint.x, spawnPoint.y);
    }

    /**
     * Loads the map
     * @param {Object} data
     */
    parseMap(data: Array<Array<Tile>>) {
        this.data = data;
        this.w = this.data.length;
        this.h = this.data[0].length;

        for (let x: number = 0; x < this.w; x++) {
            for (let y: number = 0; y < this.h; y++) {
                let block: Tile = this.data[x][y];

                if (block.pickup == "pickup_flag_blue") {
                    this.flags.blue = new Vector(x, y)
                }
                if (block.pickup == "pickup_flag_green") {
                    this.flags.green = new Vector(x, y)
                }
                if (block.spawn == "spawn_blue") {
                    this.spawns.blue.push(new Vector(x + 0.5, y + 0.5));
                }
                if (block.spawn == "spawn_green") {
                    this.spawns.green.push(new Vector(x + 0.5, y + 0.5));
                }
            }
        };
    }

    /**
     * Render the map based on position
     * first pass renders the floor, decals, spawn and portals
     * second pass renders walls, shadows and pickups
     * @param {vector2} view
     * @param {integer} pass
     */
    renderView(view: Vector, pass: number) {
        let block: Tile = null;

        let viewSizeX: number = Math.ceil((gfx.width / 2) / tileSize);
        let viewSizeY: number = Math.ceil((gfx.height / 2) / tileSize);


        let pMapX: number = Math.floor(view.x);
        let pMapY: number = Math.floor(view.y);

        gfx.pushMatrix();

        gfx.translate(gfx.width / 2 + tileSize / 2 - view.x * tileSize, gfx.height / 2 + tileSize / 2 - view.y * tileSize);


        // on boucle sur toutes les tiles autour du joueur
        for (let x: number = pMapX - viewSizeX; x < pMapX + viewSizeX + 1; x++) {
            for (let y: number = pMapY - viewSizeY - 1; y < pMapY + viewSizeY + 1; y++) {
                if (x < this.w && y < this.h && x >= 0 && y >= 0) {
                    block = this.data[x][y];
                    let px = x * tileSize;
                    let py = y * tileSize;

                    // first pass: render floor, decals, spawn and portals
                    if (!pass || pass == 1) {
                        if (block.tex && !block.solid) {
                            gfx.sprite(block.tex, px, py, tileSize, tileSize);
                        }

                        if (block.decals) {
                            for (var i = 0; i < block.decals.length; i++) {
                                gfx.sprite(block.decals[i], px, py, tileSize, tileSize);
                            }
                        }

                        if (Editor && block.spawn) {
                            gfx.sprite(block.spawn, px, py, tileSize - time.morphs.smallfast, tileSize - time.morphs.smallfast);
                        }

                        if (block.portal) {
                            gfx.pushMatrix();
                            gfx.translate(px, py);
                            gfx.rotate(time.elapsed);
                            gfx.sprite("portal_" + block.portal.color, 0, 0, tileSize - time.morphs.bigslow, tileSize - time.morphs.bigslow);
                            gfx.popMatrix();
                        }
                    }

                    // second pass: render walls, shadows and pickups
                    if (!pass || pass == 2) {
                        if (block.tex && block.solid) {
                            gfx.sprite(block.tex, px, py, tileSize, tileSize);
                        }
                        if (block.shadow) {
                            gfx.sprite(block.shadow, px, py, tileSize, tileSize);
                        }

                        if (block.pickup) {
                            gfx.sprite("light", px, py, tileSize - time.morphs.bigfast, tileSize - time.morphs.bigfast);
                            gfx.sprite(block.pickup, px, py, tileSize - time.morphs.smallslow, tileSize - time.morphs.smallslow);
                        }
                        if (block.flag) {
                            gfx.sprite("light", px, py, tileSize - time.morphs.bigfast, tileSize - time.morphs.bigfast);
                            gfx.sprite(block.flag, px, py, tileSize - time.morphs.smallslow, tileSize - time.morphs.smallslow);
                        }
                    }

                    if (Editor && Editor.showGrid) {
                        if (block.solid) {
                            gfx.sprite("red", px, py, tileSize, tileSize);
                        } else {
                            gfx.sprite("green", px, py, tileSize, tileSize);
                        }
                    }
                }
            }
        }


        gfx.popMatrix();
    }

    /**
     * Resets the map (Editor method)
     */
    resetData() {
        let w: number = parseInt(document.getElementById("editor_Width_id")['value']);
        let h: number = parseInt(document.getElementById("editor_Height_id")['value']);
        this.init(w, h, true);
    }

}
