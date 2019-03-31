"use strict";
var gfx = {
    width: 1920,
    height: 1080,
    offset: { x: 0, y: 0 },
    ratio: { x: 0, y: 0 },
    id: 0,
    canvas: null,
    ctx: null,
    cachedImages: {},

    init() {
        this.setupCanvas();
        $(this.canvas).css({ width: '100%' });

        this.resizeCanvas();
    },

    setupCanvas: function () {
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
    },

    resizeCanvas: function () {
        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;
        this.ratio.x = this.width / $(this.canvas).width();
        this.ratio.y = this.height / $(this.canvas).height();
        this.offset.y = (window.innerHeight - $("#canvas").height()) / 2;
    },

    clear: function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    sprite: function (img, x, y, w, h) {
        img = '/assets/' + img + '.png';
        let image = gfx.cachedImages[img];

        if (!image) {
            gfx.cachedImages[img] = new Image(256, 256);
            image = gfx.cachedImages[img];
            image.src = img;
        }
        else {
            let width = w || image.naturalWidth;
            let height = h || image.naturalHeight;
            gfx.ctx.drawImage(image, x, y, width, height);
        }
    },

    drawTile: function (img, x, y) {
        img = '/assets/' + img + '.png';
        let image = gfx.cachedImages[img];

        if (!image) {
            gfx.cachedImages[img] = new Image(256, 256);
            image = gfx.cachedImages[img];
            image.src = img;
        }
        else {
            gfx.ctx.drawImage(image, x, y, Editor.map.tileSize, Editor.map.tileSize);
        }
    },

    spriteSheet: function (img, sx, sy, sw, sh, dx, dy, dw, dh) {
        img = '/assets/' + img + '.png';
        let image = gfx.cachedImages[img];

        if (!image) {
            gfx.cachedImages[img] = new Image(256, 256);
            image = gfx.cachedImages[img];
            image.src = img;
        }
        else {
            gfx.ctx.drawImage(image, sx, sy, sw, sh, dx - dw / 2, dy - dh / 2, dw, dh);
        }
    },

    rotate: function (angle) {
        this.ctx.rotate(angle);// * Math.PI / 180);
    },

    pushMatrix: function () {
        this.ctx.save();
    },

    popMatrix: function () {
        this.ctx.restore();
    },

    translate: function (x, y) {
        this.ctx.translate(x, y);
    },

    fill: function (r, g, b, a) {
        this.ctx.fillStyle = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a / 100 + ')';;
    },

    rect: function (x, y, w, h) {
        this.ctx.strokeRect(x, y, w, h);
        this.ctx.fillRect(x, y, w, h);
    }

}

window.onresize = function () { gfx.resizeCanvas(); }
