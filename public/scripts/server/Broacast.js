"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Broadcast = /** @class */ (function () {
    function Broadcast() {
        this.reset();
    }
    Broadcast.prototype.extract = function () {
        var extract = {};
        if (this.joined.length > 0)
            extract['joined'] = this.joined;
        ;
        if (this.combat.length > 0)
            extract['combat'] = this.combat;
        if (this.left.length > 0)
            extract['left'] = this.left;
        if (this.flagAction.length > 0)
            extract['flagAction'] = this.flagAction;
        return extract;
    };
    Broadcast.prototype.reset = function () {
        this.joined = [];
        this.combat = [];
        this.left = [];
        this.flagAction = [];
    };
    Broadcast.prototype.addJoined = function (message) {
        this.joined.push(message);
    };
    Broadcast.prototype.addCombat = function (message) {
        this.combat.push(message);
    };
    Broadcast.prototype.addLeft = function (message) {
        this.left.push(message);
    };
    Broadcast.prototype.addFlagAction = function (message) {
        this.flagAction.push(message);
    };
    return Broadcast;
}());
exports.default = Broadcast;
