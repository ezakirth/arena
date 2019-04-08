"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector_1 = require("./Vector");
var Input = /** @class */ (function () {
    function Input() {
        this.mouse = {
            left: false,
            middle: false,
            right: false,
            browser: { x: 0, y: 0 },
            x: 0,
            y: 0,
            mapX: 0,
            mapY: 0,
        };
        this.view = new Vector_1.default(0, 0);
        this.inertia = new Vector_1.default(0, 0);
        this.keyboard = { active: false };
        this.speed = 10;
    }
    Input.prototype.init = function () {
        var _this = this;
        window.addEventListener('mousedown', function (e) { _this.inputDown(e); });
        window.addEventListener('mouseup', function (e) { _this.inputUp(e); });
        window.addEventListener('mousemove', function (e) { _this.inputMove(e); });
        document.addEventListener('touchstart', function (e) { _this.inputDown(e); });
        document.addEventListener('touchend', function (e) { _this.inputUp(e); });
        document.addEventListener('touchmove', function (e) { _this.inputMove(e); });
        window.addEventListener('keyup', function (e) { _this.keyHandler(e); });
        window.addEventListener('keydown', function (e) { _this.keyHandler(e); });
        window.addEventListener('contextmenu', function (e) { _this.rightClick(e); });
        window.addEventListener('wheel', function (e) { _this.wheelAction(e); });
    };
    Input.prototype.update = function () {
        this.updateMapPosition();
        var deltaMovement = time.delta * this.speed;
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
        this.view.x = clamp(this.view.x, 0, map.w - 5);
        this.view.y = clamp(this.view.y, 0, map.h);
    };
    Input.prototype.wheelAction = function (e) {
        //tileSize += (e.deltaY / Math.abs(e.deltaY)) * 2;
    };
    Input.prototype.rightClick = function (e) {
        e.preventDefault();
        return false;
    };
    Input.prototype.inputUp = function (e) {
        this.mouse.active = false;
        if (e.button == 0)
            this.mouse.left = false;
        if (e.button == 1)
            this.mouse.middle = false;
        if (e.button == 2)
            this.mouse.right = false;
        this.getPosition(e);
        if (Editor)
            Editor.calculateShadows();
    };
    Input.prototype.inputDown = function (e) {
        this.mouse.active = true;
        this.mouse.left = (e.button == 0);
        this.mouse.middle = (e.button == 1);
        this.mouse.right = (e.button == 2);
        this.getPosition(e);
    };
    Input.prototype.inputMove = function (e) {
        this.getPosition(e);
    };
    Input.prototype.keyHandler = function (e) {
        this.keyboard.active = (e.type == "keydown");
        this.keyboard[e.key] = this.keyboard.active;
    };
    Input.prototype.getPosition = function (event) {
        var x, y;
        if (event.touches) {
            x = (event.touches[0] ? event.touches[0].pageX : this.mouse.browser.x);
            y = (event.touches[0] ? event.touches[0].pageY : this.mouse.browser.y);
            this.keyboard.ArrowUp = this.mouse.active;
        }
        else {
            x = event.clientX;
            y = event.clientY;
        }
        this.mouse.browser.x = x;
        this.mouse.browser.y = y;
        this.mouse.x = this.mouse.browser.x * gfx.ratio.x;
        this.mouse.y = (this.mouse.browser.y - gfx.offset.y) * gfx.ratio.y;
    };
    Input.prototype.updateMapPosition = function () {
        var screenX = this.mouse.x + this.view.x * tileSize - gfx.width / 2;
        var screenY = this.mouse.y + this.view.y * tileSize - gfx.height / 2;
        this.mouse.mapX = Math.floor(screenX / tileSize);
        this.mouse.mapY = Math.floor(screenY / tileSize);
    };
    return Input;
}());
exports.default = Input;
