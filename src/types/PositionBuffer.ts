import Vector from "../common/Vector";

export default class PositionBuffer {
    timestamp: number;
    position: Vector;
    direction: Vector;
    constructor(timestamp: number, position: Vector, direction: Vector) {
        this.timestamp = timestamp;
        this.position = position;
        this.direction = direction;
    }
}
