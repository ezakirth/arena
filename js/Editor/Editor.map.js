"use strict";
Editor.map = {

    init: function (w, h, forceNew) {
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
    },

    load: function (data) {
        this.data = data;
        this.w = this.data.length;
        this.h = this.data[0].length;
        $("#editor_Width_id").val(this.w);
        $("#editor_Height_id").val(this.h);

    },




    render: function () {
        let viewSizeX = Math.ceil(gfx.canvas.width / tileSize) + 1;
        let viewSizeY = Math.ceil(gfx.canvas.height / tileSize) + 1;
        let pMapX = Math.floor(Input.view.x);
        let pMapY = Math.floor(Input.view.y);

        gfx.pushMatrix();
        gfx.translate(-Input.view.x * tileSize, -Input.view.y * tileSize);

        // on boucle sur toutes les tiles autour du joueur
        for (let x = pMapX; x < pMapX + viewSizeX; x++) {
            for (let y = pMapY; y < pMapY + viewSizeY; y++) {
                // on empeche de regarder en dehors de la map (là où il n'y a pas de tile)
                if (x >= 0 && x < this.w && y >= 0 && y < this.h) {
                    let px = x * tileSize;
                    let py = y * tileSize;

                    var block = this.data[x][y];
                    if (block.tex) {
                        gfx.drawTile(block.tex, px, py);
                    }
                    if (block.shadow) {
                        gfx.drawTile(block.shadow, px, py);
                    }
                    if (block.decals) {
                        for (let i = 0; i < block.decals.length; i++) {
                            gfx.drawTile(block.decals[i], px, py);
                        }
                    }
                    if (Editor.showGrid) {
                        if (block.solid) {
                            gfx.drawTile("red", px, py);
                        } else {
                            gfx.drawTile("green", px, py);
                        }
                    }
                    if (block.spawn) {
                        gfx.drawTile(block.spawn, px, py);
                    }
                    if (block.portal) {
                        gfx.drawTile("portal_" + block.portal.color, px, py);
                    }
                    if (block.pickup) {
                        gfx.drawTile("light", px, py);
                        gfx.drawTile(block.pickup, px, py);
                    }


                }
            }
        }
        gfx.popMatrix();

    },



    resetData: function () {
        let w = parseInt($("#editor_Width_id").val());
        let h = parseInt($("#editor_Height_id").val());
        this.init(w, h, true);
    },


    saveData: function (data, filename) {
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
    },

    loadData: function (e) {
        if (e.target.files[0]) {
            var tmppath = URL.createObjectURL(e.target.files[0]);
            $.getJSON(tmppath, function (data) {
                Editor.map.load(data);
            });
        }
    }

}
