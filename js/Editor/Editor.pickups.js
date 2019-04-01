
Editor.addPickup = function (type, px, py) {
    var tile = map.data[px][py];
    if (tile.solid || tile.portal || tile.spawn) return;

    tile.tex = 'floor_' + type;


    if (type.startsWith('spawn')) {
        tile.spawn = type;
    }
    else {
        tile.pickup = "pickup_" + type;
    }
    Input.mouse.left = false;
}

Editor.clearPickup = function (px, py) {
    var tile = map.data[px][py];

    tile.tex = 'floor_1';

    tile.spawn = null;

    tile.pickup = null;


    Input.mouse.left = false;
}
