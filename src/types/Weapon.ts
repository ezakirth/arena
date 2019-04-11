export default class Weapon {
    type: string;
    name: string;
    sprite: string;
    dmg: number;
    rate: number;
    speed: number;
    range: number;
    ammo: number;
    weight: number;
    bouncy: boolean;

    constructor(type: string, name: string, sprite: string, dmg: number, rate: number, speed: number, range: number, ammo: number, weight: number, bouncy: boolean) {
        this.type = type;
        this.name = name;
        this.sprite = sprite;
        this.dmg = dmg;
        this.rate = rate;
        this.speed = speed;
        this.range = range;
        this.ammo = ammo;
        this.weight = weight;
        this.bouncy = bouncy;
    }
}
