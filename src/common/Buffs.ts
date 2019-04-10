class Buff {
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

export default class Buffs {
    medkit: Buff;
    shield: Buff;
    speed: Buff;
    constructor() {
        this.medkit = new Buff('buff', 'medkit', 30, 0, 0);
        this.shield = new Buff('buff', 'shield', 0, 25, 0);
        this.speed = new Buff('buff', 'speed', 0, 0, 0.05);
    }
}
