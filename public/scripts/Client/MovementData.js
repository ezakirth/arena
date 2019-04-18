"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MovementData = /** @class */ (function () {
    function MovementData(deltaPosition, deltaDirection, sequence, lobbyId) {
        this.deltaPosition = deltaPosition;
        this.deltaDirection = deltaDirection;
        this.sequence = sequence;
        this.lobbyId = lobbyId;
    }
    return MovementData;
}());
exports.default = MovementData;
