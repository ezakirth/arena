/**
 * If player walks on a pickup, trigger its respawn
 */
Player.prototype.checkPickup = function (tile, x, y) {
    if (tile.pickup) {
        timer.addRespawn({ pickup: tile.pickup, map: map.data, x: x, y: y, delay: 10 });
        tile.pickup = null;
    }
}
