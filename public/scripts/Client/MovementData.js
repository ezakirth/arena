"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MovementData = /** @class */ (function () {
    function MovementData(deltaPosition, deltaDirection, sequence, appliedAuthoring, lobbyId) {
        this.deltaPosition = deltaPosition;
        this.deltaDirection = deltaDirection;
        this.sequence = sequence;
        this.appliedAuthoring = appliedAuthoring;
        this.lobbyId = lobbyId;
    }
    return MovementData;
}());
exports.default = MovementData;
