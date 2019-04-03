/**
 * If player walks on a pickup, trigger its respawn
 */
Player.prototype.checkPickup = function (tile, x, y) {
    if (tile.pickup) {
        let name = tile.pickup.replace('pickup_', '');
        let pickup = Pickups.buffs[name] || Pickups.weapons[name] || Pickups.flags[name];
        if (pickup) {
            let action = {};
            if (pickup.type == 'weapon') action = this.pickupWeapon(pickup);
            if (pickup.type == 'buff') action = this.pickupBuff(pickup);
            if (pickup.type == 'flag') action = this.pickupFlag(pickup, x, y);

            let respawnInfo = { pickup: tile.pickup, map: map.data, x: x, y: y, delay: action.delay };
            if (action.respawn) timer.addRespawn(respawnInfo);
            if (action.used) tile.pickup = null;
        }
    }
}


/**
 * Equips a weapon
 * @param {Object} pickup
 */
Player.prototype.pickupWeapon = function (pickup) {
    this.weapon = pickup;
    this.ammo = pickup.ammo;
    return { respawn: true, delay: 10, used: true };
}

/**
 * Consumes a buff
 * @param {Object} pickup
 */
Player.prototype.pickupBuff = function (pickup) {
    this.life += pickup.life;
    this.shield += pickup.shield;
    this.speed += pickup.speed;
    return { respawn: true, delay: 10, used: true };;
}

/**
 * Attempts to steal flag
 * @param {Object} pickup
 * @param {Integer} x
 * @param {Integer} y
 */
Player.prototype.pickupFlag = function (pickup, x, y) {
    // if it's the player's flag
    if (pickup.name == 'flag_' + this.team) {
        // if already on location
        if (map.flags[this.team].x == x && map.flags[this.team].y == y) {
            // if we have the enemy flag, cap it
            if (this.hasEnemyFlag) {
                // return enemy flag
                this.returnFlag(this.enemyTeam, this);
                this.hasEnemyFlag = false;
                return { respawn: false, delay: 0, used: false };
            }
            // nothing special, do nothing
            else {
                return { respawn: false, delay: 0, used: false };
            }
        }
        // else we return it to base
        else {
            return { respawn: true, delay: 0, used: true };
        }
    }
    // if it's the enemy team's flag
    else {
        this.hasEnemyFlag = true;
        return { respawn: false, delay: 0, used: true };;
    }
}

Player.prototype.returnFlag = function (team, player) {
    let delay = 10;
    // if we return our own flag, respawn it immediatly
    if (player.team == team) delay = 0;
    // if it's the enemy flag, then respawn it in 10 seconds
    if (player.enemyTeam == team) delay = 10;

    timer.addRespawn({ pickup: 'pickup_flag_' + team, map: map.data, x: map.flags[team].x, y: map.flags[team].y, delay: delay });
}
