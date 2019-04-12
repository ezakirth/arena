import Flag from './Flag';

export default class Buffs {
    flag_blue: Flag;
    flag_green: Flag;
    constructor() {
        this.flag_blue = new Flag('flag', 'flag_blue');
        this.flag_green = new Flag('flag', 'flag_green');
    }
}
