import Vector from "../common/Vector";

export default class MovementData {
    deltaPosition: Vector;
    deltaDirection: Vector;
    appliedAuthoring: boolean;
    sequence: number;
    lobbyId: string;
    constructor(deltaPosition: Vector, deltaDirection: Vector, sequence: number, appliedAuthoring: boolean, lobbyId: string) {
        this.deltaPosition = deltaPosition;
        this.deltaDirection = deltaDirection;
        this.sequence = sequence;
        this.appliedAuthoring = appliedAuthoring;
        this.lobbyId = lobbyId;
    }
}
