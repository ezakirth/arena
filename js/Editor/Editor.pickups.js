/**
 * Add a pickup or spawn location to the map
 */
Editor.addPickup = function (type, px, py) {
    var tile = map.data[px][py];
    if (tile.solid || tile.portal || tile.spawn) return;

    if (type.startsWith('spawn')) {
        tile.spawn = type;
    }
    // use matching pickup floor texture (has shadow of the pickup)
    else {
        tile.tex = 'floor_' + type;
        tile.pickup = "pickup_" + type;
    }
    input.mouse.left = false;
}

/**
 * Removes pickup (item or spawn location)
 */
Editor.clearPickup = function (px, py) {
    var tile = map.data[px][py];

    tile.spawn = null;
    if (tile.pickup) {
        // reapply basic floor texture
        this.randomFloorTile(tile);
        tile.pickup = null;
    }
    input.mouse.right = false;
}
