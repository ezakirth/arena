class Flag {
    type: string;
    name: string;

    constructor(type: string, name: string) {
        this.type = type;
        this.name = name;
    }
}

export default class Buffs {
    flag_blue: Flag;
    flag_green: Flag;
    constructor() {
        this.flag_blue = new Flag('flag', 'flag_blue');
        this.flag_green = new Flag('flag', 'flag_green');
    }
}

