import Buffs from './Buffs';
import Weapons from './Weapons';
import Flags from './Flags';

export default class Pickups {
    buffs: Buffs;
    flags: Flags;
    weapons: Weapons;

    constructor() {

        this.buffs = new Buffs();
        this.flags = new Flags();
        this.weapons = new Weapons();
    }
}

