export default class Broadcast {
    joined: any[];
    combat: any[];
    left: any[];
    flagAction: any[];

    constructor() {
        this.reset();
    }

    extract() {
        let extract = {};
        if (this.joined.length > 0) extract['joined'] = this.joined;;
        if (this.combat.length > 0) extract['combat'] = this.combat;
        if (this.left.length > 0) extract['left'] = this.left;
        if (this.flagAction.length > 0) extract['flagAction'] = this.flagAction;
        return extract;
    }

    reset() {
        this.joined = [];
        this.combat = [];
        this.left = [];
        this.flagAction = [];
    }

    addJoined(message: any) {
        this.joined.push(message);
    }
    addCombat(message: any) {
        this.combat.push(message);
    }
    addLeft(message: any) {
        this.left.push(message);
    }
    addFlagAction(message: any) {
        this.flagAction.push(message);
    }
}
