import Weapon from '../types/Weapon';

export default class Weapons {
    gun: Weapon;
    minigun: Weapon;
    blastgun: Weapon;
    railgun: Weapon;
    shotgun: Weapon;
    rpg: Weapon;

    constructor() {
        this.gun = new Weapon('weapon', 'gun', 'bullet', 20, 0.4, 0.2, 500, 1 / 0, 1.0);
        this.minigun = new Weapon('weapon', 'minigun', 'bullet', 8, 0.1, 0.2, 800, 60, 2.0);
        this.blastgun = new Weapon('weapon', 'blastgun', 'blast', 15, 0.2, 0.2, 1000, 60, 2.5);
        this.railgun = new Weapon('weapon', 'railgun', 'blast3', 150, 2, 0.4, 1000, 5, 3);
        this.shotgun = new Weapon('weapon', 'shotgun', 'bullet', 10, 1.5, 0.2, 300, 15, 1.5);
        this.rpg = new Weapon('weapon', 'rpg', 'bullet', 100, 1, 0.1, 3000, 10, 3);
    }
}
