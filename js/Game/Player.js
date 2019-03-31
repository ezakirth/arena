class Player {
    constructor(x, y) {
        this.pos = new Vector(x, y);

        this.dir = new Vector(1, 0);
        this.speed = .1;

        this.id = Game.players.length;

        this.justUsedPortal = false;

        if (solo) {

        }
    }

    update() {
        this.dir = Vector.subtract(new Vector(gfx.width / 2, gfx.height / 2), new Vector(Input.mouse.x, Input.mouse.y)).normalize();
        this.dirSide = Vector.rotate(this.dir, Math.PI / 2);

        let oldX = this.pos.x;
        let oldY = this.pos.y;
        let oldPx = Math.floor(this.pos.x);
        let oldPy = Math.floor(this.pos.y);


        let portal = Game.map.data[oldPx][oldPy].portal;
        if (portal) {
            if (!this.justUsedPortal) {
                this.pos.x = portal.dx + .5;
                this.pos.y = portal.dy + .5;
                this.justUsedPortal = true;
            }
        }
        else {
            this.justUsedPortal = false;
        }


        if (Input.keyboard.ArrowLeft) {
            this.pos.add(this.dirSide.multiply(this.speed));
        }
        if (Input.keyboard.ArrowRight) {
            this.pos.subtract(this.dirSide.multiply(this.speed));
        }

        if (Input.keyboard.ArrowUp) {
            this.pos.subtract(this.dir.multiply(this.speed));
        }
        if (Input.keyboard.ArrowDown) {
            this.pos.add(this.dir.multiply(this.speed));
        }

        let px = Math.floor(this.pos.x);
        let py = Math.floor(this.pos.y);

        if (Game.map.data[oldPx][py].solid) this.pos.y = oldY;
        if (Game.map.data[px][oldPy].solid) this.pos.x = oldX;



    }


    render() {
        var block = null;

        var bigfastmorph = tileSize - Math.abs(Math.sin(Game.elapsedTime / 100) * 20);
        var bigslowmorph = tileSize - Math.abs(Math.sin(Game.elapsedTime / 200) * 20);
        var smallfastmorph = tileSize - Math.abs(Math.sin(Game.elapsedTime / 100) * 10);
        var smallslowmorph = tileSize - Math.abs(Math.sin(Game.elapsedTime / 200) * 10);


        let viewSizeX = Math.ceil((gfx.width / 2) / tileSize);
        let viewSizeY = Math.ceil((gfx.height / 2) / tileSize);


        let pMapX = Math.floor(this.pos.x);
        let pMapY = Math.floor(this.pos.y);

        gfx.pushMatrix();

        gfx.translate(gfx.width / 2 + tileSize / 2 - this.pos.x * tileSize, gfx.height / 2 + tileSize / 2 - this.pos.y * tileSize);


        // on boucle sur toutes les tiles autour du joueur
        for (let x = pMapX - viewSizeX; x < pMapX + viewSizeX + 1; x++) {
            for (let y = pMapY - viewSizeY - 1; y < pMapY + viewSizeY + 1; y++) {
                if (x < Game.map.w && y < Game.map.h && x >= 0 && y >= 0) {
                    block = Game.map.data[x][y];
                    let px = x * tileSize;
                    let py = y * tileSize;
                    // read && display tile content;
                    if (block.tex && !block.solid) {
                        gfx.sprite(block.tex, px, py, tileSize, tileSize);
                    }

                    if (block.decals) {
                        for (var i = 0; i < block.decals.length; i++) {
                            gfx.sprite(block.decals[i], px, py, tileSize, tileSize);
                        }
                    }

                    if (block.spawn) {
                        gfx.sprite(block.spawn, px, py, smallfastmorph, smallfastmorph);
                    }

                    if (block.portal) {
                        gfx.pushMatrix();
                        gfx.translate(px, py);
                        gfx.rotate(Game.elapsedTime / 10 * Math.PI / 180);
                        gfx.sprite("portal_" + block.portal.color, 0, 0, bigslowmorph, bigslowmorph);
                        gfx.popMatrix();
                    }
                }
            }
        }


        gfx.popMatrix();


        gfx.pushMatrix();
        gfx.translate(gfx.width / 2, gfx.height / 2);


        let ang = Math.atan2(this.dir.y, this.dir.x);

        gfx.rotate(ang - Math.PI / 2);
        gfx.sprite("shadow", 0, 0, bigslowmorph * ((320 / 3) / 210), bigslowmorph);
        gfx.spriteSheet("Toon" + this.id, 0, 0, 320 / 3, 210, 0, 0, tileSize * ((320 / 3) / 210), tileSize);
        gfx.popMatrix();





        gfx.pushMatrix();

        gfx.translate(gfx.width / 2 + tileSize / 2 - this.pos.x * tileSize, gfx.height / 2 + tileSize / 2 - this.pos.y * tileSize);


        // on boucle sur toutes les tiles autour du joueur
        for (let x = pMapX - viewSizeX; x < pMapX + viewSizeX + 1; x++) {
            for (let y = pMapY - viewSizeY - 1; y < pMapY + viewSizeY + 1; y++) {
                if (x < Game.map.w && y < Game.map.h && x >= 0 && y >= 0) {
                    block = Game.map.data[x][y];
                    let px = x * tileSize;
                    let py = y * tileSize;
                    // read && display tile content;
                    if (block.tex && block.solid) {
                        gfx.sprite(block.tex, px, py, tileSize, tileSize);
                    }
                    if (block.shadow) {
                        gfx.sprite(block.shadow, px, py, tileSize, tileSize);
                    }


                    if (block.pickup) {
                        gfx.sprite("light", px, py, bigfastmorph, bigfastmorph);
                        gfx.sprite(block.pickup, px, py, smallslowmorph, smallslowmorph);
                    }
                }
            }
        }


        gfx.popMatrix();







    }


}
