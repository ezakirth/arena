class Timer {
    constructor() {
        this.now = +new Date();
        this.last = this.now;
        this.delta = 0;
        this.elapsed = 0;

        this.morphs = {}

        this.respawns = [];
    }

    update() {
        this.now = +new Date();
        this.delta = (this.now - this.last) / 1000.0;
        this.last = this.now;
        this.elapsed += this.delta;

        this.checkRespawns();
        this.updateMorphs();
    }

    updateMorphs() {
        this.morphs.bigfast = tileSize - Math.abs(Math.sin(this.elapsed * 8) * 20);
        this.morphs.bigslow = tileSize - Math.abs(Math.sin(this.elapsed * 4) * 20);
        this.morphs.smallfast = tileSize - Math.abs(Math.sin(this.elapsed * 8) * 10);
        this.morphs.smallslow = tileSize - Math.abs(Math.sin(this.elapsed * 4) * 10);
    }

    /**
     * Goes through all items to be respawned and respawn them if the delay has expired
     */
    checkRespawns() {
        for (let index = this.respawns.length - 1; index >= 0; index--) {
            let item = this.respawns[index];

            item.delay -= this.delta;
            if (item.delay <= 0) {
                item.map[item.x][item.y].pickup = item.pickup;
                this.respawns.splice(index, 1);
            }
        }
    }

    /**
     * Adds a pickup to the list of respawn timers
     * @param {Object} item 
     */
    addRespawn(item) {
        this.respawns.push(item);
    }
}
