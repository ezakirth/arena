import Weapon from './Weapon';

export default class Weapons {
    gun: Weapon;
    minigun: Weapon;
    blastgun: Weapon;
    railgun: Weapon;
    shotgun: Weapon;
    rpg: Weapon;

    constructor() {
        this.gun = new Weapon('weapon', 'gun', 'projectile', 20, 0.4, 0.20, 2, 1 / 0, 1.0, false);
        this.minigun = new Weapon('weapon', 'minigun', 'projectile', 8, 0.1, 0.20, 2, 60, 2.0, false);
        this.blastgun = new Weapon('weapon', 'blastgun', 'blast', 15, 0.2, 0.15, 4, 60, 2.5, true);
        this.railgun = new Weapon('weapon', 'railgun', 'blast3', 150, 2, 0.40, 1000, 5, 3, false);
        this.shotgun = new Weapon('weapon', 'shotgun', 'projectile', 80, 1.5, 0.3, 1, 15, 1.5, true);
        this.rpg = new Weapon('weapon', 'rpg', 'projectile', 100, 1, .10, 1000, 10, 3, false);
    }
}
