"use strict";
class Tile {
    constructor() {
        // contains the texture name (floor, etc.)
        this.tex = null;
        // true if not walkable, else false
        this.solid = true;
        // contains the pickup name (medkit, weapon, flags, etc.) (flag gathered on map load)
        this.pickup = null;
        // contains a list of decal texture names
        this.decals = [];
        // contains shadow texture name
        this.shadow = null;
        // contains spawn texture (gathered on map load)
        this.spawn = null;
        // contains portal information (color and destination)
        this.portal = null;
        // contains dropped flag texture, only used during game
        // this.flag = null;
    }
}
