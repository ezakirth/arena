"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Timer = /** @class */ (function () {
    function Timer() {
        this.now = +new Date();
        this.last = this.now;
        this.delta = 0;
        this.elapsed = 0;
        this.normalize = 0;
        this.morphs = {};
        this.timers = [];
        this.serverRenderTimestamp = 0;
        this.serverUpdateTimestamp = 0;
        this.serverLastTimestamp = 0;
    }
    Timer.prototype.update = function () {
        this.now = +new Date();
        this.delta = (this.now - this.last) / 1000.0;
        this.normalize = this.delta * 60;
        this.last = this.now;
        this.elapsed += this.delta;
        this.checkTimers();
        this.updateMorphs();
        this.networkUpdate();
    };
    Timer.prototype.updateMorphs = function () {
        this.morphs.bigfast = Math.abs(Math.sin(this.elapsed * 8) * 20);
        this.morphs.bigslow = Math.abs(Math.sin(this.elapsed * 4) * 20);
        this.morphs.smallfast = Math.abs(Math.sin(this.elapsed * 8) * 10);
        this.morphs.smallslow = Math.abs(Math.sin(this.elapsed * 4) * 10);
    };
    /**
     * Goes through all items to be respawned and respawn them if the delay has expired
     */
    Timer.prototype.checkTimers = function () {
        for (var index = this.timers.length - 1; index >= 0; index--) {
            var timer = this.timers[index];
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
    };
    /**
     * Adds a pickup to the list of respawn timers
     * @param {string} type
     * @param {number} delay
     * @param {Object} info
     */
    Timer.prototype.addTimer = function (type, delay, data) {
        this.timers.push({ type: type, delay: delay, data: data });
    };
    Timer.prototype.networkUpdate = function () {
        this.serverRenderTimestamp = this.now - 300;
    };
    Timer.prototype.updateServerDelay = function (serverLastTimestamp) {
        this.serverLastTimestamp = serverLastTimestamp;
        this.serverUpdateTimestamp = +new Date();
    };
    return Timer;
}());
exports.default = Timer;
