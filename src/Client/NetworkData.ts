import Vector from "../common/Vector";
import MovementData from "./MovementData";
import PositionBuffer from "./PositionBuffer";

export default class NetworkData {
    lobbyId: string;
    clientId: string;
    lastPosition: Vector;
    lastDirection: Vector;
    sequence: number;
    forceNoReconciliation: boolean;
    positionBuffer: PositionBuffer[];
    pendingMovement: MovementData[];
    constructor(lobbyId: string, clientId: string, lastPosition: Vector, lastDirection: Vector, sequence: number, forceNoReconciliation: boolean, positionBuffer: PositionBuffer[], pendingMovement: MovementData[]) {
        this.lobbyId = lobbyId;
        this.clientId = clientId;
        this.lastPosition = lastPosition;
        this.lastDirection = lastDirection;
        this.sequence = sequence;
        this.forceNoReconciliation = forceNoReconciliation;
        this.positionBuffer = positionBuffer;
        this.pendingMovement = pendingMovement;
    }
}
