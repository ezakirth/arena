class Timer {
    constructor() {
        this.now = +new Date();
        this.last = this.now;
        this.delta = 0;
        this.elapsed = 0;

        this.morphs = {}

        this.timers = [];
    }

    update() {
        this.now = +new Date();
        this.delta = (this.now - this.last) / 1000.0;
        this.last = this.now;
        this.elapsed += this.delta;

        this.checkTimers();
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
    checkTimers() {
        for (let index = this.timers.length - 1; index >= 0; index--) {
            let timer = this.timers[index];
            timer.delay -= this.delta;
            if (timer.delay <= 0) {
                if (timer.type == 'respawn') {
                    map.data[timer.info.x][timer.info.y].pickup = timer.info.pickup;
                }

                if (timer.type == 'buff') {
                    timer.info.player.infos[timer.info.stat] = timer.info.value;
                }
                this.timers.splice(index, 1);
            }
        }
    }

    /**
     * Adds a pickup to the list of respawn timers
     * @param {string} type 
     * @param {number} delay 
     * @param {Object} info 
     */
    addTimer(type, delay, info) {
        this.timers.push({ type, delay, info });
    }
}
