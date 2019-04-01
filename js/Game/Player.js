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

    checkTile(x, y) {
        let tile = map.data[x][y];

        this.checkPortal(tile);
        this.checkPickup(tile, x, y);
    }

    update() {
        this.dir = Vector.subtract(new Vector(gfx.width / 2, gfx.height / 2), new Vector(Input.mouse.x, Input.mouse.y)).normalize();
        this.dirSide = Vector.rotate(this.dir, Math.PI / 2);

        let oldX = this.pos.x;
        let oldY = this.pos.y;
        let oldPx = Math.floor(this.pos.x);
        let oldPy = Math.floor(this.pos.y);

        this.checkTile(oldPx, oldPy);



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

        if (map.data[oldPx][py].solid) this.pos.y = oldY;
        if (map.data[px][oldPy].solid) this.pos.x = oldX;



    }


    render() {

        map.renderView(this.pos, 1);




        gfx.pushMatrix();
        gfx.translate(gfx.width / 2, gfx.height / 2);


        let ang = Math.atan2(this.dir.y, this.dir.x);

        gfx.rotate(ang - Math.PI / 2);
        gfx.sprite("shadow", 0, 0, tileSize, tileSize);
        gfx.spriteSheet("Toon" + this.id, 0, 0, 320 / 3, 210, 0, 0, tileSize * ((320 / 3) / 210), tileSize);
        gfx.popMatrix();


        map.renderView(this.pos, 2);

    }


}
