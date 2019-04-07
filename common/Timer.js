"use strict";
exports.__esModule = true;
var Timer = /** @class */ (function () {
    function Timer() {
        this.now = +new Date();
        this.last = this.now;
        this.delta = 0;
        this.elapsed = 0;
        this.morphs = {};
        this.timers = [];
        this.networkData = {
            renderTimestamp: 0,
            serverDelay: 100,
            serverUpdateTimeStamps: [],
            serverUpdateDelay: 0,
            lastServerUpdate: 0
        };
    }
    Timer.prototype.update = function () {
        this.now = +new Date();
        this.delta = (this.now - this.last) / 1000.0;
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
                    map.queueUpdate('pickup', timer.data.pickup, timer.data.x, timer.data.y);
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
        this.networkData.renderTimestamp = this.now + this.networkData.serverUpdateDelay;
        this.networkData.lastServerUpdate += this.delta;
    };
    Timer.prototype.setServerDelay = function (timestamp) {
        this.networkData.serverUpdateTimeStamps.push(timestamp);
        if (this.networkData.serverUpdateTimeStamps.length > 2)
            this.networkData.serverUpdateTimeStamps.shift();
        this.networkData.serverUpdateDelay = this.networkData.serverUpdateTimeStamps[0] - this.networkData.serverUpdateTimeStamps[1];
    };
    return Timer;
}());
exports["default"] = Timer;