"use strict";
class Map {
    constructor() {
        this.data = null;
    }

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

    setupGame() {

        $.getJSON("map.json", function (data) {
            map.data = data;
            map.w = map.data.length;
            map.h = map.data[0].length;

            for (let x = 0; x < map.w; x++) {
                for (let y = 0; y < map.h; y++) {
                    let block = map.data[x][y];

                    if (block.pickup == "pickup_flag_blue") {
                        map.p1flag = new Vector(x, y)
                    }
                    if (block.pickup == "pickup_flag_green") {
                        map.p2flag = new Vector(x, y)
                    }
                    if (block.spawn == "spawn_blue") {
                        map.p1spawn = new Vector(x + .5, y + .5)
                    }
                    if (block.spawn == "spawn_green") {
                        map.p2spawn = new Vector(x + .5, y + .5)
                    }


                }
            };
            Game.start();
        });
        //  this.data = JSON.parse(localStorage.getItem('tileData'));
    }

    load(data) {
        this.data = data;
        this.w = this.data.length;
        this.h = this.data[0].length;
        $("#editor_Width_id").val(this.w);
        $("#editor_Height_id").val(this.h);

    }


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
                if (x < map.w && y < map.h && x >= 0 && y >= 0) {
                    block = map.data[x][y];
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
                            gfx.sprite(block.spawn, px, py, timer.morphs.smallfast, timer.morphs.smallfast);
                        }

                        if (block.portal) {
                            gfx.pushMatrix();
                            gfx.translate(px, py);
                            gfx.rotate(timer.elapsed / 10 * Math.PI / 180);
                            gfx.sprite("portal_" + block.portal.color, 0, 0, timer.morphs.bigslow, timer.morphs.bigslow);
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
                            gfx.sprite("light", px, py, timer.morphs.bigfast, timer.morphs.bigfast);
                            gfx.sprite(block.pickup, px, py, timer.morphs.smallslow, timer.morphs.smallslow);
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

    resetData() {
        let w = parseInt($("#editor_Width_id").val());
        let h = parseInt($("#editor_Height_id").val());
        this.init(w, h, true);
    }


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

    loadData(e) {
        if (e.target.files[0]) {
            var tmppath = URL.createObjectURL(e.target.files[0]);
            $.getJSON(tmppath, function (data) {
                map.load(data);
            });
        }
    }

}
