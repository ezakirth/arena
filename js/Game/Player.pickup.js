Player.prototype.checkPickup = function (tile, x, y) {
    if (tile.pickup) {
        timer.addRespawn({ pickup: tile.pickup, map: map.data, x: x, y: y, delay: 2 });
        tile.pickup = null;
    }
}
