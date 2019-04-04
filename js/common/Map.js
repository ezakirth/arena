"use strict";
class Map {
    constructor() {
        this.data = null;
        this.teams = { blue: [], green: [] };
        this.spawns = { blue: [], green: [] };
        this.flags = { blue: null, green: null };
    }

    /**
     * Sets up the map in editor mode
     * @param {integer} w
     * @param {integer} h
     * @param {boolean} forceNew
     */
    init(w, h, forceNew) {
        this.w = w;
        this.h = h;

        this.data = JSON.parse(localStorage.getItem('tileData'));
        if (!this.data || forceNew) {
            this.data = Array(this.w);
            for (var x = 0; x < this.w; x++) {
                this.data[x] = Array(this.h);
                for (var y = 0; y < this.h; y++) {
                    this.data[x][y] = new Tile();
                }
            }
        }
        this.w = this.data.length;
        this.h = this.data[0].length;

        $("#editor_Width_id").val(this.w);
        $("#editor_Height_id").val(this.h);
    }


    /**
     * Assign the client to a team (keeping them evenly matched)
     * @param {object} client
     */
    assignClientToTeam(client) {
        if (this.teams.blue.length >= this.teams.green.length) {
            this.teams.green.push(client);
            return 'green';
        }
        else {
            this.teams.blue.push(client);
            return 'blue';
        }
    }

    /**
     * Pick a random spawn point to a client
     * @param {string} team
     */
    assignSpawnToClient(team) {
        let spawnPoint = this.spawns[team][Math.floor(Math.random() * this.spawns[team].length)];

        return new Vector(spawnPoint.x, spawnPoint.y);
    }

    /**
     * setups the map in game mode, calls callback function (main loop) when done
     * @param {function} callback
     */
    setupGame(callback) {
        let _this = this;
        $.getJSON("map.json", function (data) {
            _this.parseMap(data);
            game.start();
            callback();
        });
        //  this.data = JSON.parse(localStorage.getItem('tileData'));
    }

    parseMap(data) {
        this.data = data;
        this.w = this.data.length;
        this.h = this.data[0].length;

        for (let x = 0; x < this.w; x++) {
            for (let y = 0; y < this.h; y++) {
                let block = this.data[x][y];

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
    renderView(view, pass) {
        let block = null;

        let viewSizeX = Math.ceil((gfx.width / 2) / tileSize);
        let viewSizeY = Math.ceil((gfx.height / 2) / tileSize);


        let pMapX = Math.floor(view.x);
        let pMapY = Math.floor(view.y);

        gfx.pushMatrix();

        gfx.translate(gfx.width / 2 + tileSize / 2 - view.x * tileSize, gfx.height / 2 + tileSize / 2 - view.y * tileSize);


        // on boucle sur toutes les tiles autour du joueur
        for (let x = pMapX - viewSizeX; x < pMapX + viewSizeX + 1; x++) {
            for (let y = pMapY - viewSizeY - 1; y < pMapY + viewSizeY + 1; y++) {
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
                            gfx.drawTile("red", px, py);
                        } else {
                            gfx.drawTile("green", px, py);
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
        let w = parseInt($("#editor_Width_id").val());
        let h = parseInt($("#editor_Height_id").val());
        this.init(w, h, true);
    }


    /**
     * Saves the map to a json file (Editor method)
     */
    saveData(data, filename) {
        var json = JSON.stringify(data);
        localStorage.setItem('tileData', json);

        var blob = new Blob([json], { type: "octet/stream" });
        var url = window.URL.createObjectURL(blob);

        var a = document.createElement('a');
        document.body.append(a);
        a.href = url;
        a.download = filename;
        a.click();
        $(a).remove();
        window.URL.revokeObjectURL(url);
    }

    /**
     * Loads the json file into the map (Editor method)
     */
    loadData(e) {
        if (e.target.files[0]) {
            var tmppath = URL.createObjectURL(e.target.files[0]);
            var _this = this;
            $.getJSON(tmppath, function (data) {
                _this.parseMap(data);
                $("#editor_Width_id").val(_this.w);
                $("#editor_Height_id").val(_this.h);
            });
        }
    }

}
