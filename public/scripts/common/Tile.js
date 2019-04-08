"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Tile = /** @class */ (function () {
    function Tile() {
        // true if not walkable, else false
        this.solid = true;
        // contains a list of decal texture names
        this.decals = [];
    }
    return Tile;
}());
exports.default = Tile;
