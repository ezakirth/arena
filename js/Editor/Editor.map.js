"use strict";
Editor.map = {

    init: function (w, h, forceNew) {
        this.x = 0;
        this.y = 0;

        this.w = w;
        this.h = h;

        this.tileSize = 96;

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
        this.x = Input.viewPos.x / this.tileSize;
        this.y = Input.viewPos.y / this.tileSize;
        var ix = Math.floor(this.x);
        var fx = this.x - ix;
        var fx = fx * this.tileSize;
        var iy = Math.floor(this.y);
        var fy = this.y - iy;
        var fy = fy * this.tileSize;
        var px = 0;
        var py = 0;

        Graphics.pushMatrix();
        Graphics.translate(this.tileSize / 2 - fx, this.tileSize / 2 - fy);

        this.nb = 0;
        let maxX = ix + Math.ceil(Graphics.width / this.tileSize) + 1;
        let maxY = iy + Math.ceil(Graphics.height / this.tileSize) + 1;

        for (var x = ix; x < maxX; x++) {
            for (var y = iy; y < maxY; y++) {
                if (x < this.w && y < this.h && x >= 0 && y >= 0) {
                    this.nb++;
                    var block = this.data[x][y];
                    if (block.tex) {
                        Graphics.sprite(block.tex, px, py, this.tileSize, this.tileSize);
                    }
                    if (block.shadow) {
                        Graphics.sprite(block.shadow, px, py, this.tileSize, this.tileSize);
                    }
                    if (block.decals) {
                        for (var i = 0; i < block.decals.length; i++) {
                            Graphics.sprite(block.decals[i], px, py, this.tileSize, this.tileSize);
                        }
                    }
                    if (block.portal) {
                        if (block.portal.dx) {
                            //                       tint(block.portal.r, block.portal.g, block.portal.b, 140);
                        }
                        Graphics.sprite("assets/portal", px, py, this.tileSize);
                        //                    tint(255);
                    }
                    if (block.pickup) {
                        Graphics.sprite("light", px, py, this.tileSize, this.tileSize);
                        Graphics.sprite(block.pickup, px, py, this.tileSize, this.tileSize);
                    }
                    if (Editor.showGrid) {
                        if (block.solid) {
                            Graphics.fill(255, 0, 0, 30);
                        } else {
                            Graphics.fill(0, 255, 0, 30);
                        }
                        Graphics.rect(px - this.tileSize / 2, py - this.tileSize / 2, this.tileSize, this.tileSize);
                    }
                }
                py = py + this.tileSize;
            }
            px = px + this.tileSize;
            py = 0;
        }

        Graphics.popMatrix();

    },

    resetData: function () {
        let w = parseInt($("#editor_Width_id").val());
        let h = parseInt($("#editor_Height_id").val());
        this.init(w, h, true);
    }


}
