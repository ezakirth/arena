"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Weapon_1 = require("./Weapon");
var Weapons = /** @class */ (function () {
    function Weapons() {
        this.gun = new Weapon_1.default('weapon', 'gun', 'bullet', 20, 0.4, 0.20, 2, 1 / 0, 1.0, false);
        this.minigun = new Weapon_1.default('weapon', 'minigun', 'bullet', 8, 0.1, 0.20, 2, 60, 2.0, false);
        this.blastgun = new Weapon_1.default('weapon', 'blastgun', 'blast', 15, 0.2, 0.15, 4, 60, 2.5, true);
        this.railgun = new Weapon_1.default('weapon', 'railgun', 'blast3', 150, 2, 0.40, 1000, 5, 3, false);
        this.shotgun = new Weapon_1.default('weapon', 'shotgun', 'bullet', 13, 1.5, 0.3, 1, 15, 1.5, true);
        this.rpg = new Weapon_1.default('weapon', 'rpg', 'bullet', 100, 1, .10, 1000, 10, 3, false);
    }
    return Weapons;
}());
exports.default = Weapons;
