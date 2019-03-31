
Editor.addPickup = function (type, px, py) {
    var tile = this.map.data[px][py];
    if (tile.solid || tile.portal || tile.spawn) return;

    if (type.startsWith('flag')) {
        tile.tex = 'floor_flag';
    }

    if (type.startsWith('spawn')) {
        tile.spawn = type;
    }
    else {
        tile.pickup = "pickup_" + type;
    }
    Input.mouse.left = false;
}

Editor.clearPickup = function (px, py) {
    var tile = this.map.data[px][py];

    if (tile.pickup && tile.pickup.startsWith('pickup_flag')) {
        tile.tex = 'floor_1';
    }

    tile.spawn = null;

    tile.pickup = null;


    Input.mouse.left = false;
}
