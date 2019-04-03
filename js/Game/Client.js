/**
 * Handles a client
 * @param {string} name
 */
class Client {
    /**
     * Creates a client instance
     * @param {string} name
     */
    constructor(name, clientId, team, position) {
        this.canvasId = Game.clients.length;
        this.direction = new Vector(1, 0);

        if (Game.onlineMode) {
            map.teams[team].push(this);
            this.position = new Vector(position.x, position.y);
        }
        else {
            team = map.assignClientToTeam(this);
            this.position = map.assignSpawnToClient(team);
        }

        this.infos = {
            name: name,
            life: 100,
            shield: 100,
            weapon: Pickups.weapons.gun,
            ammo: 10,
            speed: 0.05,
            hasEnemyFlag: false,
            team: team,
            enemyTeam: (team == 'green' ? 'blue' : 'green')
        }

        this.networkData = {
            clientId: clientId,
            lastPosition: { x: this.position.x, y: this.position.y, dx: this.direction.x, dy: this.direction.y },
            sequence: 0,
            positionBuffer: [],
            pendingMovement: []
        }



        this.justUsedPortal = false;
        this.dead = false;
        this.moving = false;
        this.frame = 1;


    }

    /**
     * Applies local input to the client
     */
    applyInputs() {
        if (!this.dead) {
            this.direction = Vector.subtract(new Vector(gfx.width / 2, gfx.height / 2), new Vector(Input.mouse.x, Input.mouse.y)).normalize();
            this.dirSide = Vector.rotate(this.direction, Math.PI / 2);

            let oldX = this.position.x;
            let oldY = this.position.y;
            let oldPx = Math.floor(this.position.x);
            let oldPy = Math.floor(this.position.y);

            let currentTile = map.data[oldPx][oldPy];
            this.checkTile(currentTile, oldPx, oldPy);


            this.moving = false;

            if (Input.keyboard.ArrowLeft) {
                this.moving = true;
                this.position.add(this.dirSide.multiply(this.infos.speed));
            }
            if (Input.keyboard.ArrowRight) {
                this.moving = true;
                this.position.subtract(this.dirSide.multiply(this.infos.speed));
            }

            if (Input.keyboard.ArrowUp) {
                this.moving = true;
                this.position.subtract(this.direction.multiply(this.infos.speed));
            }
            if (Input.keyboard.ArrowDown) {
                this.moving = true;
                this.position.add(this.direction.multiply(this.infos.speed));
            }

            let px = Math.floor(this.position.x);
            let py = Math.floor(this.position.y);

            if (map.data[oldPx][py].solid) this.position.y = oldY;
            if (map.data[px][oldPy].solid) this.position.x = oldX;
        }
    }

    /**
     * update the client position
     */
    update() {
        // if the client is the client, update position based on input
        if (this.networkData.clientId == Game.localClientId) {
            this.applyInputs();
        }
        // if the client is not the client (coming from network), interpolate its positions
        else {
            this.interpolatePositions();
        }


        if (this.moving)
            this.frame += time.delta * 6;
        else
            this.frame = 1;

        if (this.frame >= 3) this.frame = 0;
    }

    interpolatePositions() {
        // Find the two authoritative positions surrounding the rendering timestamp.
        var buffer = this.networkData.positionBuffer;

        // Drop positions older than 100ms.
        while (buffer.length >= 2 && buffer[1].timestamp <= time.networkData.renderTimestamp) {
            buffer.shift();
        }

        // Interpolate between the two surrounding authoritative positions.
        // startpoint is older than 100ms, endpoint is less than 100ms ago
        if (buffer.length >= 2 && buffer[0].timestamp <= time.networkData.renderTimestamp && buffer[1].timestamp >= time.networkData.renderTimestamp) {
            var x0 = buffer[0].position.x;
            var y0 = buffer[0].position.y;
            var dx0 = buffer[0].direction.x;
            var dy0 = buffer[0].direction.y;
            var t0 = buffer[0].timestamp;

            var x1 = buffer[1].position.x;
            var y1 = buffer[1].position.y;
            var dx1 = buffer[1].direction.x;
            var dy1 = buffer[1].direction.y;
            var t1 = buffer[1].timestamp;

            this.position.x = x0 + (x1 - x0) * (time.networkData.renderTimestamp - t0) / (t1 - t0);
            this.position.y = y0 + (y1 - y0) * (time.networkData.renderTimestamp - t0) / (t1 - t0);
            this.direction.x = dx0 + (dx1 - dx0) * (time.networkData.renderTimestamp - t0) / (t1 - t0);
            this.direction.y = dy0 + (dy1 - dy0) * (time.networkData.renderTimestamp - t0) / (t1 - t0);
        }
    }



    /**
     * Kills the client (drops flag if he was carrying)
     */
    die() {
        if (this.infos.hasEnemyFlag) {
            let px = Math.floor(this.position.x);
            let py = Math.floor(this.position.y);
            map.data[px][py].pickup = 'pickup_flag_' + this.infos.enemyTeam;
            this.infos.hasEnemyFlag = false;
        }
        this.dead = true;
    }

    /**
     * Renders the client and his view of the map
     * first map pass renders the floor, decals, spawn and portals
     * second map pass renders walls, shadows and pickups
     */
    render() {
        // first pass
        map.renderView(this.position, 1);

        this.renderCharacter();

        // render network clients
        for (let clientId in Game.clients) {
            if (clientId != Game.localClientId) {
                Game.clients[clientId].renderNetworkClientCharacter();
            }
        }
        // second pass
        map.renderView(this.position, 2);

        this.renderStats();

        // render network clients' stats
        for (let clientId in Game.clients) {
            if (clientId != Game.localClientId) {
                Game.clients[clientId].renderNetworkClientStats();
            }
        }

    }

    renderNetworkClientCharacter() {

        gfx.pushMatrix();
        let offsetX = (this.position.x * tileSize - Game.clients[Game.localClientId].position.x * tileSize);
        let offsetY = (this.position.y * tileSize - Game.clients[Game.localClientId].position.y * tileSize);
        gfx.translate(offsetX, offsetY);

        this.renderCharacter();
        gfx.popMatrix();
    }


    renderNetworkClientStats() {
        gfx.pushMatrix();
        let offsetX = (this.position.x * tileSize - Game.clients[Game.localClientId].position.x * tileSize);
        let offsetY = (this.position.y * tileSize - Game.clients[Game.localClientId].position.y * tileSize);
        gfx.translate(offsetX, offsetY);
        this.renderStats();
        gfx.popMatrix();
    }
    /**
     * Displays the character
     */
    renderCharacter() {
        let ang = Math.atan2(this.direction.y, this.direction.x);

        gfx.pushMatrix();
        gfx.translate(gfx.width / 2, gfx.height / 2);
        gfx.rotate(ang - Math.PI / 2);
        gfx.sprite("shadow", 0, 0, tileSize, tileSize);

        gfx.spriteSheet("toon_" + this.infos.team, 320 / 3 * Math.floor(this.frame), 0, 320 / 3, 210, 0, 0, tileSize * ((320 / 3) / 210), tileSize);
        gfx.popMatrix();
    }

    /**
     * Displays all the client stats (name, life, shield)
     */
    renderStats() {
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
     * Checks the tile the client is walking on
     * @param {Tile} tile
     * @param {Number} x
     * @param {Number} y
     */
    checkTile(tile, x, y) {

        // if it's a rogue flag (flag dropped by client)
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
                // if client walks on a weapon, equip it and trigger respawn time
                if (pickup.type == 'weapon') {
                    this.infos.weapon = pickup;
                    this.infos.ammo = pickup.ammo;
                    time.addTimer('respawn', 10, { pickup: tile.pickup, x: x, y: y });
                    tile.pickup = null;
                }
                // if client walks on a buff, consume it and trigger respawn time
                if (pickup.type == 'buff') {
                    this.infos.life += pickup.life;
                    this.infos.shield += pickup.shield;
                    if (pickup.speed != 0) time.addTimer('buff', 3, { stat: 'speed', value: this.infos.speed, client: this });
                    this.infos.speed += pickup.speed;
                    time.addTimer('respawn', 10, { pickup: tile.pickup, x: x, y: y });
                    tile.pickup = null;
                }
                // if client walks on a flag, process it
                if (pickup.type == 'flag') {
                    // if it's the enemy team's flag, the client takes it
                    if (pickup.name == 'flag_' + this.infos.enemyTeam) {
                        this.infos.hasEnemyFlag = true;
                        tile.pickup = null;
                    }
                    // else it's the client's flag
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
                this.position.x = tile.portal.dx + 0.5;
                this.position.y = tile.portal.dy + 0.5;
                this.justUsedPortal = true;
            }
        }
        else {
            this.justUsedPortal = false;
        }
    }


}
