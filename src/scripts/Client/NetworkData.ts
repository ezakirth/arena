import Vector from "../common/Vector";
import MovementData from "./MovementData";
import PositionBuffer from "./PositionBuffer";

export default class NetworkData {
    lobbyId: string;
    clientId: string;
    lastPosition: Vector;
    lastDirection: Vector;
    sequence: number;
    positionBuffer: PositionBuffer[];
    reconciliationMovement: MovementData[];
    constructor(lobbyId: string, clientId: string, lastPosition: Vector, lastDirection: Vector, sequence: number, positionBuffer: PositionBuffer[], reconciliationMovement: MovementData[]) {
        this.lobbyId = lobbyId;
        this.clientId = clientId;
        this.lastPosition = lastPosition;
        this.lastDirection = lastDirection;
        this.sequence = sequence;
        this.positionBuffer = positionBuffer;
        this.reconciliationMovement = reconciliationMovement;
    }
}
