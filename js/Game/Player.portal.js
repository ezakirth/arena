/**
 * If player walks on a portal, use it
 */
Player.prototype.checkPortal = function (tile) {
    if (tile.portal) {
        if (!this.justUsedPortal) {
            this.pos.x = tile.portal.dx + .5;
            this.pos.y = tile.portal.dy + .5;
            this.justUsedPortal = true;
        }
    }
    else {
        this.justUsedPortal = false;
    }
}
