class Player {
    constructor(x, y) {
        this.pos = new Vector(x, y);

        this.dir = new Vector(1, 0);
        this.speed = 10;

        this.id = Game.players.length;

        if (solo) {

        }
    }

    update() {
        this.dir = Vector.subtract(new Vector(gfx.width / 2, gfx.height / 2), Input.pos).normalize();
        this.dirSide = Vector.rotate(this.dir, Math.PI / 2);

        let oldX = this.pos.x;
        let oldY = this.pos.y;
        let oldPx = Math.floor(this.pos.x / Game.map.tileSize);
        let oldPy = Math.floor(this.pos.y / Game.map.tileSize);

        if (Input.key[KEY_LEFT] || Input.key[KEY_Q]) {
            this.pos.add(this.dirSide.multiply(this.speed));
        }
        if (Input.key[KEY_RIGHT] || Input.key[KEY_D]) {
            this.pos.subtract(this.dirSide.multiply(this.speed));
        }

        if (Input.key[KEY_UP] || Input.key[KEY_Z]) {
            this.pos.subtract(this.dir.multiply(this.speed));
        }
        if (Input.key[KEY_DOWN] || Input.key[KEY_S]) {
            this.pos.add(this.dir.multiply(this.speed));
        }

        let px = Math.floor(this.pos.x / Game.map.tileSize);
        let py = Math.floor(this.pos.y / Game.map.tileSize);

        if (Game.map.data[oldPx][py].solid) this.pos.y = oldY;
        if (Game.map.data[px][oldPy].solid) this.pos.x = oldX;
    }


    render() {
        var block = null;

        let tileSize = Game.map.tileSize;
        var bigfastmorph = tileSize - Math.abs(Math.sin(Game.elapsedTime / 100) * 20);
        var bigslowmorph = tileSize - Math.abs(Math.sin(Game.elapsedTime / 200) * 20);
        var smallfastmorph = tileSize - Math.abs(Math.sin(Game.elapsedTime / 100) * 10);
        var smallslowmorph = tileSize - Math.abs(Math.sin(Game.elapsedTime / 200) * 10);

        var mx = this.pos.x / tileSize;
        var my = this.pos.y / tileSize;
        var ix = Math.floor(mx);
        var fx = (mx - ix) * tileSize;
        var iy = Math.floor(my);
        var fy = (my - iy) * tileSize;

        gfx.pushMatrix();
        var w = Math.ceil(gfx.width / tileSize / 2);
        var h = Math.ceil(gfx.height / tileSize / 2);
        gfx.translate(gfx.width / 2 + tileSize / 2 - fx, gfx.height / 2 + tileSize / 2 - fy);

        var px = -w * tileSize;
        var py = -h * tileSize;


        for (var x = ix - w; x <= ix + w; x++) {
            for (var y = iy - h; y <= iy + h; y++) {
                if (x < Game.map.w && y < Game.map.h && x >= 0 && y >= 0) {
                    block = Game.map.data[x][y];
                    // read && display tile content;
                    if (block.tex) {
                        gfx.sprite(block.tex, px, py, tileSize, tileSize);
                    }
                    if (block.shadow) {
                        gfx.sprite(block.shadow, px, py, tileSize, tileSize);
                    }
                    if (block.decals) {
                        for (var i = 0; i < block.decals.length; i++) {
                            gfx.sprite(block.decals[i], px, py, tileSize, tileSize);
                        }
                    }

                    if (block.portal) {
                        tint(block.portal.r, block.portal.g, block.portal.b, 140);
                        pushMatrix();
                        translate(px, py);
                        rotate(Game.elapsedTime * 300);
                        sprite("portal", 0, 0, bigslowmorph);
                        popMatrix();
                        tint(255);
                    }
                    if (block.pickup) {
                        gfx.sprite("light", px, py, bigfastmorph, bigfastmorph);
                        gfx.sprite(block.pickup, px, py, smallslowmorph, smallslowmorph);
                    }
                }
                py = py + tileSize;
            }
            px = px + tileSize;
            py = -h * tileSize;
        }


        gfx.popMatrix();


        gfx.pushMatrix();
        gfx.translate(gfx.width / 2, gfx.height / 2);


        let ang = Math.atan2(this.dir.y, this.dir.x);

        gfx.rotate(ang - Math.PI / 2);
        gfx.sprite("shadow", 0, 0, Game.map.tileSize * ((320 / 3) / 210), Game.map.tileSize);
        gfx.spriteSheet("Toon", 0, 0, 320 / 3, 210, 0, 0, Game.map.tileSize * ((320 / 3) / 210), Game.map.tileSize);
        gfx.popMatrix();

    }


}
