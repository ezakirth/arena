class Player {
    constructor(id, x, y) {
        this.life = 100;
        this.shield = 100;
        this.ammo = 10;
        this.name = '-=BDN=- CHARpie';

        this.pos = new Vector(x, y);
        this.dir = new Vector(1, 0);
        this.speed = .05;

        this.id = id;

        this.justUsedPortal = false;

        this.moving = false;
        this.frame = 1;
    }

    /**
     * Checks the tile the player is on
     * @param {int} x 
     * @param {int} y 
     */
    checkTile(x, y) {
        let tile = map.data[x][y];

        this.checkPortal(tile);
        this.checkPickup(tile, x, y);
    }

    /**
     * update the player position 
     */
    update() {
        this.dir = Vector.subtract(new Vector(gfx.width / 2, gfx.height / 2), new Vector(Input.mouse.x, Input.mouse.y)).normalize();
        this.dirSide = Vector.rotate(this.dir, Math.PI / 2);

        let oldX = this.pos.x;
        let oldY = this.pos.y;
        let oldPx = Math.floor(this.pos.x);
        let oldPy = Math.floor(this.pos.y);

        this.checkTile(oldPx, oldPy);
        this.moving = false;



        if (Input.keyboard.ArrowLeft) {
            this.moving = true;
            this.pos.add(this.dirSide.multiply(this.speed));
        }
        if (Input.keyboard.ArrowRight) {
            this.moving = true;
            this.pos.subtract(this.dirSide.multiply(this.speed));
        }

        if (Input.keyboard.ArrowUp) {
            this.moving = true;
            this.pos.subtract(this.dir.multiply(this.speed));
        }
        if (Input.keyboard.ArrowDown) {
            this.moving = true;
            this.pos.add(this.dir.multiply(this.speed));
        }

        let px = Math.floor(this.pos.x);
        let py = Math.floor(this.pos.y);

        if (map.data[oldPx][py].solid) this.pos.y = oldY;
        if (map.data[px][oldPy].solid) this.pos.x = oldX;


        if (this.moving)
            this.frame += timer.delta * 6;
        else
            this.frame = 1;

        if (this.frame >= 3) this.frame = 0;


    }

    /**
     * Renders the player and his view of the map
     * first map pass renders the floor, decals, spawn and portals
     * second map pass renders walls, shadows and pickups
     */
    render() {
        // first pass
        map.renderView(this.pos, 1);

        this.drawPlayer();

        // second pass
        map.renderView(this.pos, 2);

        this.drawStats();
    }

    /**
     * Draws the player
     */
    drawPlayer() {
        let ang = Math.atan2(this.dir.y, this.dir.x);

        gfx.pushMatrix();
        gfx.translate(gfx.width / 2, gfx.height / 2);
        gfx.rotate(ang - Math.PI / 2);
        gfx.sprite("shadow", 0, 0, tileSize, tileSize);

        gfx.spriteSheet("Toon" + this.id, 320 / 3 * Math.floor(this.frame), 0, 320 / 3, 210, 0, 0, tileSize * ((320 / 3) / 210), tileSize);
        gfx.popMatrix();
    }

    /**
     * Displays all the player stats (name, life, shield)
     */
    drawStats() {
        let lifeVal = '100';
        let life = (tileSize / 2) / 100 * this.life + .1;
        let shield = (tileSize / 2) / 100 * this.shield + .1;
        if (this.life < 100) lifeVal = 75;
        if (this.life < 75) lifeVal = 50;
        if (this.life < 50) lifeVal = 25;
        if (this.life < 25) lifeVal = 0;

        gfx.pushMatrix();
        gfx.translate(gfx.width / 2, gfx.height / 2);
        gfx.sprite('stat_life_' + lifeVal, 0, -55, life, 8);
        gfx.sprite('stat_shield', 0, -45, shield, 8);
        gfx.drawText(this.name, 0, -68);
        gfx.popMatrix();
    }

}
