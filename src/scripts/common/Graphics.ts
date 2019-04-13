import Vector from './Vector';

declare var window: any;
declare var Editor: any;

export default class Graphics {
    width: number;
    height: number;
    browser: any;
    offset: Vector;
    ratio: Vector;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    mobile: boolean;
    cachedImages: { [name: string]: HTMLImageElement };

    constructor() {
        this.width = 1920;
        this.height = 1080;
        this.browser = { width: this.width, height: this.height };
        this.offset = new Vector(0, 0);
        this.ratio = new Vector(0, 0);
        this.cachedImages = {};

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext("2d");
        document.body.appendChild(this.canvas);
        this.mobile = false;
    }

    init() {
        let _this = this;
        this.resizeCanvas();
        window.onresize = function () { _this.resizeCanvas(); }
    }

    getWidth() {
        return this.ctx.canvas.width;
    }

    getHeight() {
        return this.ctx.canvas.height;
    }


    setStyles() {
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.strokeStyle = "black";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.font = "bold 28px Impact";

    }

    resizeCanvas() {

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

        let ratioW = window.innerWidth / window.innerHeight;
        let ratioH = window.innerHeight / window.innerWidth;
        let tileRatio = 6;
        if (Editor) tileRatio = 10;
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
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Draws an image on the canvas
     * @param img
     * @param x
     * @param y
     * @param w
     * @param h
     */
    sprite(img: string, x: number, y: number, w: number, h: number) {
        img = './assets/' + img + '.png';
        let image: HTMLImageElement = this.cachedImages[img];

        if (!image) {
            this.cachedImages[img] = new Image(256, 256);
            image = this.cachedImages[img];
            image.src = img;
        }
        else {
            let width: number = w || image.naturalWidth;
            let height: number = h || image.naturalHeight;

            this.ctx.drawImage(image, x - width / 2, y - height / 2, width, height);
        }
    }

    /**
     * Draws text on the canvas
     * @param text
     * @param x
     * @param y
     */
    drawText(text: string, x: number, y: number) {
        this.ctx.fillText(text, x, y);
        this.ctx.strokeText(text, x, y);
    }

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
    spriteSheet(img: string, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number) {
        img = './assets/' + img + '.png';
        let image: HTMLImageElement = this.cachedImages[img];

        if (!image) {
            this.cachedImages[img] = new Image(256, 256);
            image = this.cachedImages[img];
            image.src = img;
        }
        else {
            this.ctx.drawImage(image, sx, sy, sw, sh, dx - dw / 2, dy - dh / 2, dw, dh);
        }
    }

    rotate(angle: number) {
        this.ctx.rotate(angle);// * Math.PI / 180);
    }

    pushMatrix() {
        this.ctx.save();
    }

    popMatrix() {
        this.ctx.restore();
    }

    translate(x: number, y: number) {
        this.ctx.translate(x, y);
    }


}
