"use strict";
class Graphics {
    constructor() {
        this.width = 1920;
        this.height = 1080;
        this.browser = { width: 1920, height: 1080 };
        this.offset = { x: 0, y: 0 };
        this.ratio = { x: 0, y: 0 };
        this.canvas = new Array();
        this.ctx = new Array();
        this.cachedImages = {};

        this.tileSize = 1;
    }

    init() {
        let _this = this;
        this.setupCanvas();
        this.resizeCanvas();
        window.onresize = function () { _this.resizeCanvas(); }
    }

    getWidth() {
        return this.ctx.canvas.width;
    }

    getHeight() {
        return this.ctx.canvas.height;
    }

    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext("2d");
        document.body.appendChild(this.canvas);
    }

    setStyles(id) {
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.strokeStyle = "black";
        this.ctx.strokeSize = "3px";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.font = "bold 28px Impact";

    }

    resizeCanvas() {
        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;
        this.ratio.x = this.width / this.canvas.clientWidth;
        this.ratio.y = this.height / this.canvas.clientHeight;
        this.offset.y = (window.innerHeight - this.canvas.clientHeight) / 2;

        this.setStyles();

        this.browser.height = window.innerHeight;
        this.browser.width = window.innerWidth;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    sprite(img, x, y, w, h) {
        img = './assets/' + img + '.png';
        let image = this.cachedImages[img];

        if (!image) {
            this.cachedImages[img] = new Image(256, 256);
            image = this.cachedImages[img];
            image.src = img;
        }
        else {
            let width = w || image.naturalWidth;
            let height = h || image.naturalHeight;

            this.ctx.drawImage(image, x * this.tileSize - width / 2, y * this.tileSize - height / 2, width * this.tileSize, height * this.tileSize);
        }
    }

    drawText(text, x, y) {
        this.ctx.fillText(text, x * this.tileSize, y * this.tileSize);
        this.ctx.strokeText(text, x * this.tileSize, y * this.tileSize);
    }

    drawTile(img, x, y) {
        img = './assets/' + img + '.png';
        let image = this.cachedImages[img];

        if (!image) {
            this.cachedImages[img] = new Image(256, 256);
            image = this.cachedImages[img];
            image.src = img;
        }
        else {
            this.ctx.drawImage(image, x - tileSize / 2, y - tileSize / 2, tileSize, tileSize);
        }
    }

    spriteSheet(img, sx, sy, sw, sh, dx, dy, dw, dh) {
        img = './assets/' + img + '.png';
        let image = this.cachedImages[img];

        if (!image) {
            this.cachedImages[img] = new Image(256, 256);
            image = this.cachedImages[img];
            image.src = img;
        }
        else {
            this.ctx.drawImage(image, sx, sy, sw, sh, dx - dw / 2, dy - dh / 2, dw, dh);
        }
    }

    rotate(angle) {
        this.ctx.rotate(angle);// * Math.PI / 180);
    }

    pushMatrix() {
        this.ctx.save();
    }

    popMatrix() {
        this.ctx.restore();
    }

    translate(x, y) {
        this.ctx.translate(x, y);
    }


}
