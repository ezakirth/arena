"use strict";

var Utils = {
    lerp: function (start, end, amt) {
        return (1 - amt) * start + amt * end;
    },

    cerp: function (start, end, amt) {
        var amt2 = (1 - Math.cos(amt * Math.PI)) / 2;
        return start * (1 - amt2) + end * amt2;
    },

    toDegrees: function (angle) {
        return angle * (180 / Math.PI);
    },

    toRadians: function (angle) {
        return angle * (Math.PI / 180);
    },

    compare: function (a, b) {
        if (a.z < b.z)
            return -1;
        if (a.z > b.z)
            return 1;
        return 0;
    }
};


Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};
