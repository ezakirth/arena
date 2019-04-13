"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector_1 = require("./Vector");
var Input = /** @class */ (function () {
    function Input() {
        this.mouse = {
            left: false,
            middle: false,
            right: false,
            browser: new Vector_1.default(0, 0),
            position: new Vector_1.default(0, 0),
            origin: new Vector_1.default(0, 0),
            map: new Vector_1.default(0, 0)
        };
        this.touches = [];
        this.view = new Vector_1.default(0, 0);
        this.inertia = new Vector_1.default(0, 0);
        this.keyboard = { active: false };
        this.speed = 0.2;
    }
    Input.prototype.init = function () {
        var _this = this;
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
    };
    Input.prototype.update = function () {
    };
    Input.prototype.drawTouch = function () {
        if (gfx.mobile) {
            for (var i = 0; i < this.touches.length; i++) {
                var touch = this.touches[i];
                gfx.sprite('stick_bg', touch.origin.x, touch.origin.y, 128, 128);
                gfx.sprite('stick', touch.position.x, touch.position.y, 64, 64);
            }
        }
    };
    Input.prototype.updateEditorInput = function () {
        this.updateMapPosition();
        var deltaMovement = time.normalize * this.speed;
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
        if (this.mouse.browser.x > gfx.browser.width - 30)
            this.view.x += deltaMovement;
        if (this.mouse.browser.x < 30)
            this.view.x -= deltaMovement;
        if (this.mouse.browser.y > gfx.browser.height - 30)
            this.view.y += deltaMovement;
        if (this.mouse.browser.y < 30)
            this.view.y -= deltaMovement;
        // make sure we don't lose sight of the map ^^
        this.view.set(clamp(this.view.x, 0, map.width - 5), clamp(this.view.y, 0, map.height));
    };
    Input.prototype.wheelAction = function (e) {
        //tileSize += (e.deltaY / Math.abs(e.deltaY)) * 2;
    };
    Input.prototype.rightClick = function (e) {
        e.preventDefault();
        return false;
    };
    Input.prototype.mouseUp = function (e) {
        this.mouse.active = false;
        if (e.button == 0)
            this.mouse.left = false;
        if (e.button == 1)
            this.mouse.middle = false;
        if (e.button == 2)
            this.mouse.right = false;
        this.getMousePosition(e);
        if (Editor)
            Editor.calculateShadows();
    };
    Input.prototype.mouseDown = function (e) {
        this.mouse.active = true;
        this.mouse.left = (e.button == 0);
        this.mouse.middle = (e.button == 1);
        this.mouse.right = (e.button == 2);
        this.getMousePosition(e);
    };
    Input.prototype.mouseMove = function (e) {
        this.getMousePosition(e);
    };
    Input.prototype.touchStart = function (e) {
        var touches = e.changedTouches;
        for (var i = 0; i < touches.length; i++) {
            var position = new Vector_1.default(touches[i].pageX * gfx.ratio.x, (touches[i].pageY - gfx.offset.y) * gfx.ratio.y);
            var origin_1 = new Vector_1.default(position.x, position.y);
            this.touches.push({ id: touches[i].identifier, position: position, origin: origin_1 });
        }
    };
    Input.prototype.touchMove = function (e) {
        var touches = e.changedTouches;
        for (var i = 0; i < touches.length; i++) {
            var id = touches[i].identifier;
            var index = this.getCurrentTouch(id);
            if (index >= 0) {
                var currentTouch = this.touches[index];
                this.touches.splice(index, 1, { id: id, position: new Vector_1.default(touches[i].pageX * gfx.ratio.x, (touches[i].pageY - gfx.offset.y) * gfx.ratio.y), origin: currentTouch.origin });
            }
        }
    };
    Input.prototype.touchEnd = function (e) {
        var touches = e.changedTouches;
        for (var i = 0; i < touches.length; i++) {
            var id = touches[i].identifier;
            var index = this.getCurrentTouch(id);
            if (index >= 0) {
                this.touches.splice(index, 1);
            }
        }
    };
    Input.prototype.getCurrentTouch = function (id) {
        for (var i = 0; i < this.touches.length; i++) {
            if (this.touches[i].id == id) {
                return i;
            }
        }
        return -1;
    };
    Input.prototype.keyHandler = function (e) {
        this.keyboard.active = (e.type == "keydown");
        this.keyboard[e.key] = this.keyboard.active;
    };
    Input.prototype.getMousePosition = function (event) {
        this.mouse.browser.set(event.clientX, event.clientY);
        this.mouse.position.set(this.mouse.browser.x * gfx.ratio.x, (this.mouse.browser.y - gfx.offset.y) * gfx.ratio.y);
        if (event.type == 'mousedown')
            this.mouse.origin.set(this.mouse.position.x, this.mouse.position.y);
    };
    Input.prototype.updateMapPosition = function () {
        var screenX = this.mouse.position.x + this.view.x * tileSize - gfx.width / 2;
        var screenY = this.mouse.position.y + this.view.y * tileSize - gfx.height / 2;
        this.mouse.map.set(Math.floor(screenX / tileSize), Math.floor(screenY / tileSize));
    };
    return Input;
}());
exports.default = Input;
