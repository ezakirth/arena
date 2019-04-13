"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Flag_1 = require("./Flag");
var Buffs = /** @class */ (function () {
    function Buffs() {
        this.flag_blue = new Flag_1.default('flag', 'flag_blue');
        this.flag_green = new Flag_1.default('flag', 'flag_green');
    }
    return Buffs;
}());
exports.default = Buffs;
