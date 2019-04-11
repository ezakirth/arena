import Map from './Map';
declare var map: Map;

export default class Timer {
    now: number;
    last: number;
    delta: number;
    normalize: number;
    elapsed: number;
    morphs: any;
    timers: any[];

    serverRenderTimestamp: number;
    serverDelay: number;
    serverUpdateTimeStamps: number[];
    serverUpdateDelay: number;
    serverLastUpdate: number;

    constructor() {
        this.now = +new Date();
        this.last = this.now;
        this.delta = 0;
        this.elapsed = 0;
        this.normalize = 0;

        this.morphs = {}

        this.timers = [];

        this.serverRenderTimestamp = 0;
        this.serverDelay = 100;
        this.serverUpdateTimeStamps = [];
        this.serverUpdateDelay = 0;
        this.serverLastUpdate = 0;

    }

    update() {
        this.now = +new Date();
        this.delta = (this.now - this.last) / 1000.0;
        this.normalize = this.delta * 60;
        this.last = this.now;
        this.elapsed += this.delta;

        this.checkTimers();
        this.updateMorphs();

        this.networkUpdate();
    }

    updateMorphs() {
        this.morphs.bigfast = Math.abs(Math.sin(this.elapsed * 8) * 20);
        this.morphs.bigslow = Math.abs(Math.sin(this.elapsed * 4) * 20);
        this.morphs.smallfast = Math.abs(Math.sin(this.elapsed * 8) * 10);
        this.morphs.smallslow = Math.abs(Math.sin(this.elapsed * 4) * 10);
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
                    timer.data.map.queueUpdate('pickup', timer.data.pickup, timer.data.x, timer.data.y);
                }

                if (timer.type == 'buff') {
                    timer.data.client.infos[timer.data.stat] = timer.data.value;
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
    addTimer(type: string, delay: number, data: any) {
        this.timers.push({ type: type, delay: delay, data: data });
    }



    networkUpdate() {
        this.serverRenderTimestamp = this.now + this.serverUpdateDelay;
        this.serverLastUpdate += this.delta;
    }
    setServerDelay(timestamp: number) {
        this.serverUpdateTimeStamps.push(timestamp);
        if (this.serverUpdateTimeStamps.length > 2) this.serverUpdateTimeStamps.shift();
        this.serverUpdateDelay = this.serverUpdateTimeStamps[0] - this.serverUpdateTimeStamps[1];
    }
}
