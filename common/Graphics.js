"use strict";
exports.__esModule = true;
var Vector_1 = require("./Vector");
var Graphics = /** @class */ (function () {
    function Graphics() {
        this.width = 1920;
        this.height = 1080;
        this.browser = { width: 1920, height: 1080 };
        this.offset = new Vector_1["default"](0, 0);
        this.ratio = new Vector_1["default"](0, 0);
        this.cachedImages = {};
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext("2d");
        document.body.appendChild(this.canvas);
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
        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;
        this.ratio.x = this.width / this.canvas.clientWidth;
        this.ratio.y = this.height / this.canvas.clientHeight;
        this.offset.y = (window.innerHeight - this.canvas.clientHeight) / 2;
        this.setStyles();
        this.browser.height = window.innerHeight;
        this.browser.width = window.innerWidth;
    };
    Graphics.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
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
    Graphics.prototype.drawText = function (text, x, y) {
        this.ctx.fillText(text, x, y);
        this.ctx.strokeText(text, x, y);
    };
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
exports["default"] = Graphics;
