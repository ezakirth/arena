"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector_1 = require("./Vector");
var Graphics = /** @class */ (function () {
    function Graphics() {
        this.width = 1920;
        this.height = 1080;
        this.browser = { width: this.width, height: this.height };
        this.offset = new Vector_1.default(0, 0);
        this.ratio = new Vector_1.default(0, 0);
        this.cachedImages = {};
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext("2d");
        document.body.appendChild(this.canvas);
        this.mobile = false;
    }
    Graphics.prototype.init = function () {
        var _this = this;
        this.resizeCanvas();
        window.onresize = function () { _this.resizeCanvas(); };
    };
    Graphics.prototype.getWidth = function () {
        return this.ctx.canvas.width;
    };
    Graphics.prototype.getHeight = function () {
        return this.ctx.canvas.height;
    };
    Graphics.prototype.setStyles = function () {
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.strokeStyle = "black";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.font = "bold 28px Impact";
    };
    Graphics.prototype.resizeCanvas = function () {
        if (navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i))
            this.mobile = true;
        else
            this.mobile = false;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;
        this.ratio.x = this.width / this.canvas.clientWidth;
        this.ratio.y = this.height / this.canvas.clientHeight;
        this.offset.y = (window.innerHeight - this.canvas.clientHeight) / 2;
        var ratioW = window.innerWidth / window.innerHeight;
        var ratioH = window.innerHeight / window.innerWidth;
        var tileRatio = 6;
        if (Editor)
            tileRatio = 10;
        if (window.innerWidth > window.innerHeight)
            window.tileSize = (Math.floor(window.innerWidth * ratioH / tileRatio));
        else
            window.tileSize = (Math.floor(window.innerHeight * ratioW / tileRatio));
        this.browser.height = window.innerHeight;
        this.browser.width = window.innerWidth;
        /*
                this.mobile = true;
                this.ctx.canvas.width = this.width;
                this.ctx.canvas.height = this.height;
                this.ratio.x = this.width / this.canvas.clientWidth;
                this.ratio.y = this.height / this.canvas.clientHeight;
                this.offset.y = (window.innerHeight - this.canvas.clientHeight) / 2;

                this.browser.height = window.innerHeight;
                this.browser.width = window.innerWidth;
        */
        this.setStyles();
    };
    Graphics.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    /**
     * Draws an image on the canvas
     * @param img
     * @param x
     * @param y
     * @param w
     * @param h
     */
    Graphics.prototype.sprite = function (img, x, y, w, h) {
        img = './assets/' + img + '.png';
        var image = this.cachedImages[img];
        if (!image) {
            this.cachedImages[img] = new Image(256, 256);
            image = this.cachedImages[img];
            image.src = img;
        }
        else {
            var width = w || image.naturalWidth;
            var height = h || image.naturalHeight;
            this.ctx.drawImage(image, x - width / 2, y - height / 2, width, height);
        }
    };
    /**
     * Draws text on the canvas
     * @param text
     * @param x
     * @param y
     */
    Graphics.prototype.drawText = function (text, x, y) {
        this.ctx.fillText(text, x, y);
        this.ctx.strokeText(text, x, y);
    };
    /**
     * Draws a spritesheet on the canvas
     * @param img
     * @param sx
     * @param sy
     * @param sw
     * @param sh
     * @param dx
     * @param dy
     * @param dw
     * @param dh
     */
    Graphics.prototype.spriteSheet = function (img, sx, sy, sw, sh, dx, dy, dw, dh) {
        img = './assets/' + img + '.png';
        var image = this.cachedImages[img];
        if (!image) {
            this.cachedImages[img] = new Image(256, 256);
            image = this.cachedImages[img];
            image.src = img;
        }
        else {
            this.ctx.drawImage(image, sx, sy, sw, sh, dx - dw / 2, dy - dh / 2, dw, dh);
        }
    };
    Graphics.prototype.rotate = function (angle) {
        this.ctx.rotate(angle); // * Math.PI / 180);
    };
    Graphics.prototype.pushMatrix = function () {
        this.ctx.save();
    };
    Graphics.prototype.popMatrix = function () {
        this.ctx.restore();
    };
    Graphics.prototype.translate = function (x, y) {
        this.ctx.translate(x, y);
    };
    return Graphics;
}());
exports.default = Graphics;
