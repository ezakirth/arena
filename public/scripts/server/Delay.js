"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var q = require('q');
function delay(time) {
    var deferred = q.defer();
    time = isNaN(time) ? 0 : time;
    setTimeout(function () {
        deferred.resolve();
    }, time);
    return deferred.promise;
}
exports.default = delay;
