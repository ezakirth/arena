"use strict";
class Graphics {
    constructor() {
        this.width = 1920;
        this.height = 1080;
        this.browser = { width: 1920, height: 1080 },
            this.offset = { x: 0, y: 0 };
        this.ratio = { x: 0, y: 0 };
        this.id = 0;
        this.canvas = new Array();
        this.ctx = new Array();
        this.cachedImages = {};

    }

    setActiveCanvas(id) {
        this.id = id;
    }

    init() {
        this.setupCanvas(nbPlayers);

        if (nbPlayers == 1) {
            this.width = 1920;
            $(this.canvas[0]).css({ width: '100%' });
        }
        else if (nbPlayers == 2) {
            this.width = 1920 / 2;
            $(this.canvas[0]).css({ width: '50%' });
            $(this.canvas[0]).css({ left: 0 });
            $(this.canvas[1]).css({ width: '50%' });
            $(this.canvas[1]).css({ right: 0 });
        }

        this.resizeCanvas();
        window.onresize = function () { gfx.resizeCanvas(); }
    }

    getWidth() {
        return this.ctx[this.id].canvas.width;
    }

    getHeight() {
        return this.ctx[this.id].canvas.height;
    }

    setupCanvas(nb) {
        for (let i = 0; i < nb; i++) {
            this.id = this.canvas.length;
            this.canvas[this.id] = document.createElement('canvas');
            this.ctx[this.id] = this.canvas[this.id].getContext("2d");
            $("body").append(this.canvas[this.id]);
        }
    }

    setStyles(id) {
        this.ctx[id].imageSmoothingEnabled = false;
        this.ctx[id].strokeStyle = "black";
        this.ctx[id].strokeSize = "3px";
        this.ctx[id].fillStyle = "white";
        this.ctx[id].textAlign = "center";
        this.ctx[id].font = "bold 28px Impact";

    }

    resizeCanvas() {
        for (let id = 0; id < this.ctx.length; id++) {

            this.ctx[id].canvas.width = this.width;
            this.ctx[id].canvas.height = this.height;
            this.ratio.x = this.width / $(this.canvas[id]).width();
            this.ratio.y = this.height / $(this.canvas[id]).height();
            this.offset.y = (window.innerHeight - $(this.canvas[id]).height()) / 2;

            this.setStyles(id);
        }

        this.browser.height = window.innerHeight;
        this.browser.width = window.innerWidth;

    }

    clear() {
        this.ctx[this.id].clearRect(0, 0, this.canvas[this.id].width, this.canvas[this.id].height);
    }

    sprite(img, x, y, w, h) {
        img = './assets/' + img + '.png';
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
    }

    drawText(text, x, y) {
        gfx.ctx[this.id].fillText(text, x, y);
        gfx.ctx[this.id].strokeText(text, x, y);
    }

    drawTile(img, x, y) {
        img = './assets/' + img + '.png';
        let image = gfx.cachedImages[img];

        if (!image) {
            gfx.cachedImages[img] = new Image(256, 256);
            image = gfx.cachedImages[img];
            image.src = img;
        }
        else {
            gfx.ctx[this.id].drawImage(image, x - tileSize / 2, y - tileSize / 2, tileSize, tileSize);
        }
    }

    spriteSheet(img, sx, sy, sw, sh, dx, dy, dw, dh) {
        img = './assets/' + img + '.png';
        let image = gfx.cachedImages[img];

        if (!image) {
            gfx.cachedImages[img] = new Image(256, 256);
            image = gfx.cachedImages[img];
            image.src = img;
        }
        else {
            gfx.ctx[this.id].drawImage(image, sx, sy, sw, sh, dx - dw / 2, dy - dh / 2, dw, dh);
        }
    }

    rotate(angle) {
        this.ctx[this.id].rotate(angle);// * Math.PI / 180);
    }

    pushMatrix() {
        this.ctx[this.id].save();
    }

    popMatrix() {
        this.ctx[this.id].restore();
    }

    translate(x, y) {
        this.ctx[this.id].translate(x, y);
    }


}
