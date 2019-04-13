"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Buffs_1 = require("./Buffs");
var Weapons_1 = require("./Weapons");
var Flags_1 = require("./Flags");
var Pickups = /** @class */ (function () {
    function Pickups() {
        this.buffs = new Buffs_1.default();
        this.flags = new Flags_1.default();
        this.weapons = new Weapons_1.default();
    }
    return Pickups;
}());
exports.default = Pickups;
