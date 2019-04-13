"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Weapon = /** @class */ (function () {
    function Weapon(type, name, sprite, dmg, rate, speed, range, ammo, weight, bouncy) {
        this.type = type;
        this.name = name;
        this.sprite = sprite;
        this.dmg = dmg;
        this.rate = rate;
        this.speed = speed;
        this.range = range;
        this.ammo = ammo;
        this.weight = weight;
        this.bouncy = bouncy;
    }
    return Weapon;
}());
exports.default = Weapon;
