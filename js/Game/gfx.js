"use strict";
var gfx = {
    width: 1920,
    height: 1080,
    offset: { x: 0, y: 0 },
    ratio: { x: 0, y: 0 },
    id: 0,
    canvas: Array(2),
    ctx: Array(2),
    cachedImages: {},

    setActiveCanvas(id) {
        this.id = id;
    },

    init() {
        this.setupCanvas(0);
        this.setupCanvas(1);

        if (solo) {
            this.width = 1920;
            $(this.canvas[0]).css({ width: '100%' });
        }
        else {
            this.width = 1920 / 2;
            $(this.canvas[0]).css({ width: '50%' });
            $(this.canvas[0]).css({ left: 0 });
            $(this.canvas[1]).css({ width: '50%' });
            $(this.canvas[1]).css({ right: 0 });
        }

        this.resizeCanvas(0);
        this.resizeCanvas(1);

    },

    getWidth: function () {
        return this.ctx[this.id].canvas.width;
    },

    getHeight: function () {
        return this.ctx[this.id].canvas.height;
    },

    setupCanvas: function (id) {
        this.canvas[id] = document.getElementById("canvas" + id);
        this.ctx[id] = this.canvas[id].getContext("2d");
    },

    setStyles: function (id) {
        this.ctx[id].imageSmoothingEnabled = false;
        this.ctx[id].strokeStyle = "black";
        this.ctx[id].strokeSize = "3px";
        this.ctx[id].fillStyle = "white";
        this.ctx[id].textAlign = "center";
        this.ctx[id].font = "bold 28px Impact";

    },

    resizeCanvas: function (id) {
        this.ctx[id].canvas.width = this.width;
        this.ctx[id].canvas.height = this.height;
        this.ratio.x = this.width / $(this.canvas[id]).width();
        this.ratio.y = this.height / $(this.canvas[id]).height();
        this.offset.y = (window.innerHeight - $("#canvas" + id).height()) / 2;

        this.setStyles(id);
    },

    clear: function () {
        this.ctx[this.id].clearRect(0, 0, this.canvas[this.id].width, this.canvas[this.id].height);
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

            gfx.ctx[this.id].drawImage(image, x - width / 2, y - height / 2, width, height);
        }
    },

    drawText: function (text, x, y) {
        gfx.ctx[this.id].fillText(text, x, y);
        gfx.ctx[this.id].strokeText(text, x, y);
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
            gfx.ctx[this.id].drawImage(image, x - tileSize / 2, y - tileSize / 2, tileSize, tileSize);
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
            gfx.ctx[this.id].drawImage(image, sx, sy, sw, sh, dx - dw / 2, dy - dh / 2, dw, dh);
        }
    },

    rotate: function (angle) {
        this.ctx[this.id].rotate(angle);// * Math.PI / 180);
    },

    pushMatrix: function () {
        this.ctx[this.id].save();
    },

    popMatrix: function () {
        this.ctx[this.id].restore();
    },

    translate: function (x, y) {
        this.ctx[this.id].translate(x, y);
    },


}

window.onresize = function () { gfx.resizeCanvas(0); gfx.resizeCanvas(1); }
