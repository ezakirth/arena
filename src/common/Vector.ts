/*
Simple 2D JavaScript Vector Class
Hacked from evanw's lightgl.js
https://github.com/evanw/lightgl.js/blob/master/src/static _js
*/

export default class Vector {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x || 0;
        this.y = y || 0;
    }

    /* INSTANCE METHODS */

    negative() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }
    add(v: any) {
        if (v instanceof Vector) {
            this.x += v.x;
            this.y += v.y;
        } else {
            this.x += v;
            this.y += v;
        }
        return this;
    }
    subtract(v: any) {
        if (v instanceof Vector) {
            this.x -= v.x;
            this.y -= v.y;
        } else {
            this.x -= v;
            this.y -= v;
        }
        return this;
    }
    multiply(v: any) {
        if (v instanceof Vector) {
            this.x *= v.x;
            this.y *= v.y;
        } else {
            this.x *= v;
            this.y *= v;
        }
        return this;
    }
    divide(v: any) {
        if (v instanceof Vector) {
            if (v.x != 0) this.x /= v.x;
            if (v.y != 0) this.y /= v.y;
        } else {
            if (v != 0) {
                this.x /= v;
                this.y /= v;
            }
        }
        return this;
    }
    equals(v: any) {
        return this.x == v.x && this.y == v.y;
    }
    dot(v: any) {
        return this.x * v.x + this.y * v.y;
    }
    cross(v: any) {
        return this.x * v.y - this.y * v.x
    }
    length() {
        return Math.sqrt(this.dot(this));
    }
    normalize() {
        return this.divide(this.length());
    }
    min() {
        return Math.min(this.x, this.y);
    }
    max() {
        return Math.max(this.x, this.y);
    }
    toAngles() {
        return -Math.atan2(-this.y, this.x);
    }
    angleTo(a: any) {
        return Math.acos(this.dot(a) / (this.length() * a.length()));
    }
    toArray(n: any) {
        return [this.x, this.y].slice(0, n || 2);
    }
    clone() {
        return new Vector(this.x, this.y);
    }
    set(x: number, y: number) {
        this.x = x; this.y = y;
        return this;
    }

    rotate(angle: number) {
        var nx = (this.x * Math.cos(angle)) - (this.y * Math.sin(angle));
        var ny = (this.x * Math.sin(angle)) + (this.y * Math.cos(angle));

        this.x = nx;
        this.y = ny;

        return this;
    }



    /* STATIC METHODS */
    static _negative(v: Vector) {
        return new Vector(-v.x, -v.y);
    }
    static _add(a: any, b: any) {
        if (b instanceof Vector) return new Vector(a.x + b.x, a.y + b.y);
        else return new Vector(a.x + b, a.y + b);
    }
    static _subtract(a: any, b: any) {
        if (b instanceof Vector) return new Vector(a.x - b.x, a.y - b.y);
        else return new Vector(a.x - b, a.y - b);
    }
    static _multiply(a: any, b: any) {
        if (b instanceof Vector) return new Vector(a.x * b.x, a.y * b.y);
        else return new Vector(a.x * b, a.y * b);
    }
    static _divide(a: any, b: any) {
        if (b instanceof Vector) return new Vector(a.x / b.x, a.y / b.y);
        else return new Vector(a.x / b, a.y / b);
    }
    static _equals(a: any, b: any) {
        return a.x == b.x && a.y == b.y;
    }
    static _dot(a: any, b: any) {
        return a.x * b.x + a.y * b.y;
    }
    static _cross(a: any, b: any) {
        return a.x * b.y - a.y * b.x;
    }

    static _rotate(vec: Vector, angle: number) {
        let v = new Vector(vec.x, vec.y);
        var nx = (v.x * Math.cos(angle)) - (v.y * Math.sin(angle));
        var ny = (v.x * Math.sin(angle)) + (v.y * Math.cos(angle));

        v.x = nx;
        v.y = ny;

        return v;
    }
}
