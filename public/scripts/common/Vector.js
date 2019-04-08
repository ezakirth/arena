"use strict";
/*
Simple 2D JavaScript Vector Class
Hacked from evanw's lightgl.js
https://github.com/evanw/lightgl.js/blob/master/src/static _js
*/
Object.defineProperty(exports, "__esModule", { value: true });
var Vector = /** @class */ (function () {
    function Vector(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    /* INSTANCE METHODS */
    Vector.prototype.negative = function () {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    };
    Vector.prototype.add = function (v) {
        if (v instanceof Vector) {
            this.x += v.x;
            this.y += v.y;
        }
        else {
            this.x += v;
            this.y += v;
        }
        return this;
    };
    Vector.prototype.subtract = function (v) {
        if (v instanceof Vector) {
            this.x -= v.x;
            this.y -= v.y;
        }
        else {
            this.x -= v;
            this.y -= v;
        }
        return this;
    };
    Vector.prototype.multiply = function (v) {
        if (v instanceof Vector) {
            this.x *= v.x;
            this.y *= v.y;
        }
        else {
            this.x *= v;
            this.y *= v;
        }
        return this;
    };
    Vector.prototype.divide = function (v) {
        if (v instanceof Vector) {
            if (v.x != 0)
                this.x /= v.x;
            if (v.y != 0)
                this.y /= v.y;
        }
        else {
            if (v != 0) {
                this.x /= v;
                this.y /= v;
            }
        }
        return this;
    };
    Vector.prototype.equals = function (v) {
        return this.x == v.x && this.y == v.y;
    };
    Vector.prototype.dot = function (v) {
        return this.x * v.x + this.y * v.y;
    };
    Vector.prototype.cross = function (v) {
        return this.x * v.y - this.y * v.x;
    };
    Vector.prototype.length = function () {
        return Math.sqrt(this.dot(this));
    };
    Vector.prototype.normalize = function () {
        return this.divide(this.length());
    };
    Vector.prototype.min = function () {
        return Math.min(this.x, this.y);
    };
    Vector.prototype.max = function () {
        return Math.max(this.x, this.y);
    };
    Vector.prototype.toAngles = function () {
        return -Math.atan2(-this.y, this.x);
    };
    Vector.prototype.angleTo = function (a) {
        return Math.acos(this.dot(a) / (this.length() * a.length()));
    };
    Vector.prototype.toArray = function (n) {
        return [this.x, this.y].slice(0, n || 2);
    };
    Vector.prototype.clone = function () {
        return new Vector(this.x, this.y);
    };
    Vector.prototype.set = function (x, y) {
        this.x = x;
        this.y = y;
        return this;
    };
    Vector.prototype.rotate = function (angle) {
        var nx = (this.x * Math.cos(angle)) - (this.y * Math.sin(angle));
        var ny = (this.x * Math.sin(angle)) + (this.y * Math.cos(angle));
        this.x = nx;
        this.y = ny;
        return this;
    };
    /* STATIC METHODS */
    Vector._negative = function (v) {
        return new Vector(-v.x, -v.y);
    };
    Vector._add = function (a, b) {
        if (b instanceof Vector)
            return new Vector(a.x + b.x, a.y + b.y);
        else
            return new Vector(a.x + b, a.y + b);
    };
    Vector._subtract = function (a, b) {
        if (b instanceof Vector)
            return new Vector(a.x - b.x, a.y - b.y);
        else
            return new Vector(a.x - b, a.y - b);
    };
    Vector._multiply = function (a, b) {
        if (b instanceof Vector)
            return new Vector(a.x * b.x, a.y * b.y);
        else
            return new Vector(a.x * b, a.y * b);
    };
    Vector._divide = function (a, b) {
        if (b instanceof Vector)
            return new Vector(a.x / b.x, a.y / b.y);
        else
            return new Vector(a.x / b, a.y / b);
    };
    Vector._equals = function (a, b) {
        return a.x == b.x && a.y == b.y;
    };
    Vector._dot = function (a, b) {
        return a.x * b.x + a.y * b.y;
    };
    Vector._cross = function (a, b) {
        return a.x * b.y - a.y * b.x;
    };
    Vector._rotate = function (vec, angle) {
        var v = new Vector(vec.x, vec.y);
        var nx = (v.x * Math.cos(angle)) - (v.y * Math.sin(angle));
        var ny = (v.x * Math.sin(angle)) + (v.y * Math.cos(angle));
        v.x = nx;
        v.y = ny;
        return v;
    };
    return Vector;
}());
exports.default = Vector;
