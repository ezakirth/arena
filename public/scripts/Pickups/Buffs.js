"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Buff_1 = require("./Buff");
var Buffs = /** @class */ (function () {
    function Buffs() {
        this.medkit = new Buff_1.default('buff', 'medkit', 30, 0, 0);
        this.shield = new Buff_1.default('buff', 'shield', 0, 25, 0);
        this.speed = new Buff_1.default('buff', 'speed', 0, 0, 0.1);
    }
    return Buffs;
}());
exports.default = Buffs;
