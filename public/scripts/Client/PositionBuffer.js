"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PositionBuffer = /** @class */ (function () {
    function PositionBuffer(timestamp, position, direction) {
        this.timestamp = timestamp;
        this.position = position;
        this.direction = direction;
    }
    return PositionBuffer;
}());
exports.default = PositionBuffer;
