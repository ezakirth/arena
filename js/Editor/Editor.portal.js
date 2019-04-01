
Editor.addPortal = function (type, px, py) {
    var tile = map.data[px][py];
    if (tile.solid || tile.pickup || tile.portal || tile.spawn) return;

    // if we have an origin for this portal, link them together
    if (this.portalOrigin) {
        tile.portal = {
            color: this.portalOrigin.color,
            dx: this.portalOrigin.x,
            dy: this.portalOrigin.y
        };

        map.data[this.portalOrigin.x][this.portalOrigin.y].portal = {
            color: this.portalOrigin.color,
            dx: px,
            dy: py
        }

        this.portalOrigin = null;
    }
    // else this is the portal origin, save it for now
    else {
        tile.portal = {
            color: type,
            dx: px,
            dy: py
        };

        this.portalOrigin = {
            color: type,
            x: px,
            y: py
        }
    }


    Input.mouse.left = false;
}

Editor.clearPortal = function (px, py) {
    var tile = map.data[px][py];

    if (tile.portal) {
        map.data[tile.portal.dx][tile.portal.dy].portal = null;
        tile.portal = null;
        this.portalOrigin = null;
    }
    Input.mouse.left = false;
}
