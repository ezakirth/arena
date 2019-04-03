/**
 * Handles a player
 * @param {string} name
 */
class Player {
    /**
     * Creates a player instance
     * @param {string} name 
     */
    constructor(name) {
        this.id = Game.players.length;

        this.infos = {
            name: name,
            life: 100,
            shield: 100,
            weapon: Pickups.weapons.gun,
            ammo: 10,
            speed: 0.05,
            hasEnemyFlag: false,
            team: map.assignPlayer(this),
        }
        this.infos.enemyTeam = (this.infos.team == 'green' ? 'blue' : 'green');

        this.justUsedPortal = false;
        this.dead = false;
        this.moving = false;
        this.frame = 1;

        this.pos = map.assignSpawn(this);
        this.dir = new Vector(1, 0);

    }

    /**
     * update the player position
     */
    update() {
        if (!this.dead) {

            this.dir = Vector.subtract(new Vector(gfx.width / 2, gfx.height / 2), new Vector(Input.mouse.x, Input.mouse.y)).normalize();
            this.dirSide = Vector.rotate(this.dir, Math.PI / 2);

            let oldX = this.pos.x;
            let oldY = this.pos.y;
            let oldPx = Math.floor(this.pos.x);
            let oldPy = Math.floor(this.pos.y);

            let currentTile = map.data[oldPx][oldPy];
            this.checkTile(currentTile, oldPx, oldPy);


            this.moving = false;

            if (Input.keyboard.ArrowLeft) {
                this.moving = true;
                this.pos.add(this.dirSide.multiply(this.infos.speed));
            }
            if (Input.keyboard.ArrowRight) {
                this.moving = true;
                this.pos.subtract(this.dirSide.multiply(this.infos.speed));
            }

            if (Input.keyboard.ArrowUp) {
                this.moving = true;
                this.pos.subtract(this.dir.multiply(this.infos.speed));
            }
            if (Input.keyboard.ArrowDown) {
                this.moving = true;
                this.pos.add(this.dir.multiply(this.infos.speed));
            }

            let px = Math.floor(this.pos.x);
            let py = Math.floor(this.pos.y);

            if (map.data[oldPx][py].solid) this.pos.y = oldY;
            if (map.data[px][oldPy].solid) this.pos.x = oldX;


            if (this.moving)
                this.frame += time.delta * 6;
            else
                this.frame = 1;

            if (this.frame >= 3) this.frame = 0;
        }

    }

    /**
     * Kills the player (drops flag if he was carrying)
     */
    die() {
        if (this.infos.hasEnemyFlag) {
            let px = Math.floor(this.pos.x);
            let py = Math.floor(this.pos.y);
            map.data[px][py].pickup = 'pickup_flag_' + this.infos.enemyTeam;
            this.infos.hasEnemyFlag = false;
        }
        this.dead = true;
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

        gfx.spriteSheet("toon_" + this.infos.team, 320 / 3 * Math.floor(this.frame), 0, 320 / 3, 210, 0, 0, tileSize * ((320 / 3) / 210), tileSize);
        gfx.popMatrix();
    }

    /**
     * Displays all the player stats (name, life, shield)
     */
    drawStats() {
        let lifeVal = '100';
        let life = (tileSize / 2) / 100 * this.infos.life + 0.1;
        let shield = (tileSize / 2) / 100 * this.infos.shield + 0.1;
        if (this.infos.life < 100) lifeVal = 75;
        if (this.infos.life < 75) lifeVal = 50;
        if (this.infos.life < 50) lifeVal = 25;
        if (this.infos.life < 25) lifeVal = 0;

        gfx.pushMatrix();
        gfx.translate(gfx.width / 2, gfx.height / 2);
        gfx.sprite('stat_life_' + lifeVal, 0, -55, life, 8);
        gfx.sprite('stat_shield', 0, -45, shield, 8);
        gfx.drawText(this.infos.name, 0, -68);
        gfx.popMatrix();
    }


    /**
     * Checks the tile the player is walking on
     * @param {Tile} tile 
     * @param {Number} x 
     * @param {Number} y 
     */
    checkTile(tile, x, y) {

        // if it's a rogue flag (flag dropped by player)
        if (tile.flag) {
            let pickup = Pickups.flags[tile.flag];

            // if it's enemy flag, we take it
            if (pickup.name == 'flag_' + this.infos.enemyTeam) {
                this.infos.hasEnemyFlag = true;
            }
            // else it's our flag, so we return it
            else {
                time.addTimer('respawn', 0, { pickup: 'pickup_flag_' + this.infos.team, x: map.flags[this.infos.team].x, y: map.flags[this.infos.team].y });
            }
            tile.flag = null;
        }

        // if it's a pickup (weapon, buff, flag)
        if (tile.pickup) {
            let name = tile.pickup.replace('pickup_', '');
            let pickup = Pickups.buffs[name] || Pickups.weapons[name] || Pickups.flags[name]
            if (pickup) {
                // if player walks on a weapon, equip it and trigger respawn timer
                if (pickup.type == 'weapon') {
                    this.infos.weapon = pickup;
                    this.infos.ammo = pickup.ammo;
                    time.addTimer('respawn', 10, { pickup: tile.pickup, x: x, y: y });
                    tile.pickup = null;
                }
                // if player walks on a buff, consume it and trigger respawn timer
                if (pickup.type == 'buff') {
                    this.infos.life += pickup.life;
                    this.infos.shield += pickup.shield;
                    if (pickup.speed != 0) time.addTimer('buff', 3, { stat: 'speed', value: this.infos.speed, player: this });
                    this.infos.speed += pickup.speed;
                    time.addTimer('respawn', 10, { pickup: tile.pickup, x: x, y: y });
                    tile.pickup = null;
                }
                // if player walks on a flag, process it 
                if (pickup.type == 'flag') {
                    // if it's the enemy team's flag, the player takes it
                    if (pickup.name == 'flag_' + this.infos.enemyTeam) {
                        this.infos.hasEnemyFlag = true;
                        tile.pickup = null;
                    }
                    // else it's the player's flag
                    else {
                        // If we are at our flag spawn location and have the enemy flag, capture it
                        if (map.flags[this.infos.team].x == x && map.flags[this.infos.team].y == y && this.infos.hasEnemyFlag) {
                            time.addTimer('respawn', 10, { pickup: 'pickup_flag_' + this.infos.enemyTeam, x: map.flags[this.infos.enemyTeam].x, y: map.flags[this.infos.enemyTeam].y });
                            this.infos.hasEnemyFlag = false;
                        }
                    }
                }
            }
        }

        // if it's a portal
        if (tile.portal) {
            if (!this.justUsedPortal) {
                this.pos.x = tile.portal.dx + 0.5;
                this.pos.y = tile.portal.dy + 0.5;
                this.justUsedPortal = true;
            }
        }
        else {
            this.justUsedPortal = false;
        }
    }


}
