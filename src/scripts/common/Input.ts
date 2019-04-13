import Vector from './Vector';
import Timer from './Timer';
import Map from '../Map/Map';
import Graphics from './Graphics';

declare var time: Timer;
declare var map: Map;
declare var gfx: Graphics;
declare var tileSize: number;
declare var Editor: any;
declare var clamp: Function;

export default class Input {
    mouse: any;
    view: Vector;
    inertia: Vector;
    keyboard: any;
    speed: number;
    touches: any[];

    constructor() {
        this.mouse = {
            left: false,
            middle: false,
            right: false,
            browser: new Vector(0, 0),
            position: new Vector(0, 0),
            origin: new Vector(0, 0),
            map: new Vector(0, 0)
        };

        this.touches = [];


        this.view = new Vector(0, 0);
        this.inertia = new Vector(0, 0);

        this.keyboard = { active: false };

        this.speed = 0.2;
    }

    init() {
        let _this = this;
        window.addEventListener('mousedown', function (e) { _this.mouseDown(e); });
        window.addEventListener('mouseup', function (e) { _this.mouseUp(e); });
        window.addEventListener('mousemove', function (e) { _this.mouseMove(e); });

        window.addEventListener('touchstart', function (e) { _this.touchStart(e); });
        window.addEventListener('touchend', function (e) { _this.touchEnd(e); });
        window.addEventListener('touchmove', function (e) { _this.touchMove(e); });


        window.addEventListener('keyup', function (e) { _this.keyHandler(e); });
        window.addEventListener('keydown', function (e) { _this.keyHandler(e); });

        window.addEventListener('contextmenu', function (e) { _this.rightClick(e); });
        window.addEventListener('wheel', function (e) { _this.wheelAction(e); });

    }

    update() {

    }

    drawTouch() {
        if (gfx.mobile) {
            for (let i = 0; i < this.touches.length; i++) {
                let touch = this.touches[i];

                gfx.sprite('stick_bg', touch.origin.x, touch.origin.y, 128, 128);
                gfx.sprite('stick', touch.position.x, touch.position.y, 64, 64);
            }
        }
    }


    updateEditorInput() {
        this.updateMapPosition();

        let deltaMovement = time.normalize * this.speed;

        if (this.keyboard.ArrowLeft) {
            this.inertia.x += deltaMovement;
            this.view.x -= deltaMovement;
        }
        if (this.keyboard.ArrowRight) {
            this.inertia.x -= deltaMovement;
            this.view.x += deltaMovement;
        }

        if (this.keyboard.ArrowUp) {
            this.inertia.y += deltaMovement;
            this.view.y -= deltaMovement;
        }
        if (this.keyboard.ArrowDown) {
            this.inertia.y -= deltaMovement;
            this.view.y += deltaMovement;
        }

        this.inertia.x -= (this.inertia.x / 1.5) * deltaMovement;
        this.view.x -= this.inertia.x * deltaMovement;

        this.inertia.y -= (this.inertia.y / 1.5) * deltaMovement;
        this.view.y -= this.inertia.y * deltaMovement;


        if (this.mouse.browser.x > gfx.browser.width - 30) this.view.x += deltaMovement;
        if (this.mouse.browser.x < 30) this.view.x -= deltaMovement;
        if (this.mouse.browser.y > gfx.browser.height - 30) this.view.y += deltaMovement;
        if (this.mouse.browser.y < 30) this.view.y -= deltaMovement;

        // make sure we don't lose sight of the map ^^
        this.view.set(clamp(this.view.x, 0, map.width - 5), clamp(this.view.y, 0, map.height));

    }

    wheelAction(e) {
        //tileSize += (e.deltaY / Math.abs(e.deltaY)) * 2;
    }

    rightClick(e) {
        e.preventDefault();
        return false;
    }

    mouseUp(e) {
        this.mouse.active = false;
        if (e.button == 0) this.mouse.left = false;
        if (e.button == 1) this.mouse.middle = false;
        if (e.button == 2) this.mouse.right = false;
        this.getMousePosition(e);
        if (Editor) Editor.calculateShadows();
    }

    mouseDown(e) {
        this.mouse.active = true;
        this.mouse.left = (e.button == 0);
        this.mouse.middle = (e.button == 1);
        this.mouse.right = (e.button == 2);
        this.getMousePosition(e);
    }

    mouseMove(e) {
        this.getMousePosition(e);
    }

    touchStart(e: TouchEvent) {
        let touches: TouchList = e.changedTouches;
        for (let i = 0; i < touches.length; i++) {
            let position = new Vector(touches[i].pageX * gfx.ratio.x, (touches[i].pageY - gfx.offset.y) * gfx.ratio.y);
            let origin = new Vector(position.x, position.y);

            this.touches.push({ id: touches[i].identifier, position: position, origin: origin });
        }
    }

    touchMove(e: TouchEvent) {
        let touches: TouchList = e.changedTouches;
        for (let i = 0; i < touches.length; i++) {
            let id = touches[i].identifier;
            let index = this.getCurrentTouch(id);
            if (index >= 0) {
                let currentTouch = this.touches[index];
                this.touches.splice(index, 1, { id: id, position: new Vector(touches[i].pageX * gfx.ratio.x, (touches[i].pageY - gfx.offset.y) * gfx.ratio.y), origin: currentTouch.origin });
            }
        }
    }

    touchEnd(e: TouchEvent) {
        let touches: TouchList = e.changedTouches;
        for (let i = 0; i < touches.length; i++) {
            let id = touches[i].identifier;
            let index = this.getCurrentTouch(id);
            if (index >= 0) {
                this.touches.splice(index, 1);
            }
        }
    }

    getCurrentTouch(id: number) {
        for (let i = 0; i < this.touches.length; i++) {
            if (this.touches[i].id == id) {
                return i;
            }
        }
        return -1;
    }

    keyHandler(e) {
        this.keyboard.active = (e.type == "keydown");
        this.keyboard[e.key] = this.keyboard.active;
    }


    getMousePosition(event) {

        this.mouse.browser.set(event.clientX, event.clientY);

        this.mouse.position.set(this.mouse.browser.x * gfx.ratio.x, (this.mouse.browser.y - gfx.offset.y) * gfx.ratio.y);

        if (event.type == 'mousedown')
            this.mouse.origin.set(this.mouse.position.x, this.mouse.position.y);
    }

    updateMapPosition() {
        var screenX = this.mouse.position.x + this.view.x * tileSize - gfx.width / 2;
        var screenY = this.mouse.position.y + this.view.y * tileSize - gfx.height / 2;

        this.mouse.map.set(Math.floor(screenX / tileSize), Math.floor(screenY / tileSize));
    }
}
