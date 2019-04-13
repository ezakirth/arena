"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NetworkData = /** @class */ (function () {
    function NetworkData(lobbyId, clientId, lastPosition, lastDirection, sequence, ignoreClientMovement, positionBuffer, reconciliationMovement) {
        this.lobbyId = lobbyId;
        this.clientId = clientId;
        this.lastPosition = lastPosition;
        this.lastDirection = lastDirection;
        this.sequence = sequence;
        this.ignoreClientMovement = ignoreClientMovement;
        this.positionBuffer = positionBuffer;
        this.reconciliationMovement = reconciliationMovement;
    }
    return NetworkData;
}());
exports.default = NetworkData;
