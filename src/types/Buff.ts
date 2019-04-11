export default class Buff {
    type: string;
    name: string;
    life: number;
    shield: number;
    speed: number;

    constructor(type: string, name: string, life: number, shield: number, speed: number) {
        this.type = type;
        this.name = name;
        this.life = life;
        this.shield = shield;
        this.speed = speed;
    }
}
