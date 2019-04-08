"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector_1 = require("./Vector");
var Tile_1 = require("./Tile");
var Map = /** @class */ (function () {
    function Map() {
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
    Map.prototype.init = function (w, h, forceNew) {
        this.w = w;
        this.h = h;
        this.data = JSON.parse(localStorage.getItem('tileData'));
        if (!this.data || forceNew) {
            this.data = Array(this.w);
            for (var x = 0; x < this.w; x++) {
                this.data[x] = Array(this.h);
                for (var y = 0; y < this.h; y++) {
                    this.data[x][y] = new Tile_1.default();
                }
            }
        }
        this.w = this.data.length;
        this.h = this.data[0].length;
        document.getElementById("editor_Width_id")['value'] = this.w;
        document.getElementById("editor_Height_id")['value'] = this.h;
    };
    /**
     * Server method: adds an update to the queue
     * @param type
     * @param value
     * @param x
     * @param y
     */
    Map.prototype.queueUpdate = function (type, value, x, y) {
        this.updates.push({ type: type, value: value, x: x, y: y });
    };
    /**
     * Client method: processes the update queue
     */
    Map.prototype.processUpdates = function () {
        for (var _i = 0, _a = this.updates; _i < _a.length; _i++) {
            var update = _a[_i];
            var tile = this.data[update.x][update.y];
            tile[update.type] = update.value;
        }
        this.updates = [];
    };
    /**
     * Pick a random spawn point for a client
     * @param {string} team
     */
    Map.prototype.assignSpawnToClient = function (team) {
        var spawnPoint = this.spawns[team][Math.floor(Math.random() * this.spawns[team].length)];
        return new Vector_1.default(spawnPoint.x, spawnPoint.y);
    };
    /**
     * Loads the map
     * @param {Object} data
     */
    Map.prototype.parseMap = function (data) {
        this.data = data;
        this.w = this.data.length;
        this.h = this.data[0].length;
        for (var x = 0; x < this.w; x++) {
            for (var y = 0; y < this.h; y++) {
                var block = this.data[x][y];
                if (block.pickup == "pickup_flag_blue") {
                    this.flags.blue = new Vector_1.default(x, y);
                }
                if (block.pickup == "pickup_flag_green") {
                    this.flags.green = new Vector_1.default(x, y);
                }
                if (block.spawn == "spawn_blue") {
                    this.spawns.blue.push(new Vector_1.default(x + 0.5, y + 0.5));
                }
                if (block.spawn == "spawn_green") {
                    this.spawns.green.push(new Vector_1.default(x + 0.5, y + 0.5));
                }
            }
        }
        ;
    };
    /**
     * Render the map based on position
     * first pass renders the floor, decals, spawn and portals
     * second pass renders walls, shadows and pickups
     * @param {vector2} view
     * @param {integer} pass
     */
    Map.prototype.renderView = function (view, pass) {
        var block = null;
        var viewSizeX = Math.ceil((gfx.width / 2) / tileSize);
        var viewSizeY = Math.ceil((gfx.height / 2) / tileSize);
        var pMapX = Math.floor(view.x);
        var pMapY = Math.floor(view.y);
        gfx.pushMatrix();
        gfx.translate(gfx.width / 2 + tileSize / 2 - view.x * tileSize, gfx.height / 2 + tileSize / 2 - view.y * tileSize);
        // on boucle sur toutes les tiles autour du joueur
        for (var x = pMapX - viewSizeX; x < pMapX + viewSizeX + 1; x++) {
            for (var y = pMapY - viewSizeY - 1; y < pMapY + viewSizeY + 1; y++) {
                if (x < this.w && y < this.h && x >= 0 && y >= 0) {
                    block = this.data[x][y];
                    var px = x * tileSize;
                    var py = y * tileSize;
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
                        if (block.spawn) {
                            gfx.sprite(block.spawn, px, py, tileSize - time.morphs.smallfast, tileSize - time.morphs.smallfast);
                        }
                        if (block.portal) {
                            gfx.pushMatrix();
                            gfx.translate(px, py);
                            gfx.rotate(time.elapsed / 10 * Math.PI / 180);
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
                        }
                        else {
                            gfx.sprite("green", px, py, tileSize, tileSize);
                        }
                    }
                }
            }
        }
        gfx.popMatrix();
    };
    /**
     * Resets the map (Editor method)
     */
    Map.prototype.resetData = function () {
        var w = parseInt(document.getElementById("editor_Width_id")['value']);
        var h = parseInt(document.getElementById("editor_Height_id")['value']);
        this.init(w, h, true);
    };
    return Map;
}());
exports.default = Map;
