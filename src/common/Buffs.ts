import Buff from '../types/Buff';

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
