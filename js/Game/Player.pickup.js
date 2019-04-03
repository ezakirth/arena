/**
 * If player walks on a pickup, trigger its respawn
 */
Player.prototype.checkPickup = function (tile, x, y) {
    let name = 'pickup_' + tile.pickup;
    let pickup = Pickups.buffs[name] || Pickups.weapons[name] || Pickups.flags[name];
    if (pickup) {
        let action = {};
        if (pickup.type == 'weapon') action = this.pickupWeapon(pickup);
        if (pickup.type == 'buff') action = this.pickupBuff(pickup);
        if (pickup.type == 'flag') action = this.pickupFlag(pickup, x, y);

        let respawnInfo = { pickup: name, map: map.data, x: x, y: y, delay: action.delay };
        if (action.respawn) timer.addRespawn(respawnInfo);
        if (action.used) tile.pickup = null;
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
        // if already on location, do nothing
        if (map.flags[this.team].x == x && map.flags[this.team].y == y) {
            return { respawn: false, delay: 0, used: false };
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
