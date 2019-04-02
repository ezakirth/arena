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
    Input.mouse.left = false;
}

/**
 * Removes pickup (item or spawn location)
 */
Editor.clearPickup = function (px, py) {
    var tile = map.data[px][py];

    // reapply basic floor texture
    tile.tex = 'floor_1';

    tile.spawn = null;
    tile.pickup = null;

    Input.mouse.left = false;
}
