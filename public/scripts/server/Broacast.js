"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Broadcast = /** @class */ (function () {
    function Broadcast() {
        this.reset();
    }
    Broadcast.prototype.cleanup = function () {
        if (this.joined.length == 0)
            delete this.joined;
        if (this.combat.length == 0)
            delete this.combat;
        if (this.left.length == 0)
            delete this.left;
        if (this.flagAction.length == 0)
            delete this.flagAction;
        return this;
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
