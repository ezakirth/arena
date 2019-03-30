"use strict";

var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var KEY_UP = 38;
var KEY_DOWN = 40;


var Input = {
    origin: new Vector(),
    pos: new Vector(),
    real: new Vector(),
    delta: new Vector(),
    key: Array(256),

    viewPos: new Vector(),
    speed: 1,
    mouse: { left: false, middle: false, right: false },

    init: function () {
        window.addEventListener('touchstart', Input.inputDown);
        window.addEventListener('touchend', Input.inputUp);
        window.addEventListener('touchmove', Input.inputMove);

        window.addEventListener('mousedown', Input.inputDown);
        window.addEventListener('mouseup', Input.inputUp);
        window.addEventListener('mousemove', Input.inputMove);

        window.addEventListener('keyup', Input.inputKeyUp);
        window.addEventListener('keydown', Input.inputKeyDown);

        window.addEventListener('contextmenu', Input.rightClick);
        window.addEventListener('wheel', Input.wheelAction);

    },


    update: function () {
        if (Input.key[KEY_LEFT]) {
            Input.delta.x += Input.speed;
            Input.viewPos.x -= Input.speed;
        }
        if (Input.key[KEY_RIGHT]) {
            Input.delta.x -= Input.speed;
            Input.viewPos.x += Input.speed;
        }

        if (Input.key[KEY_UP]) {
            Input.delta.y += Input.speed;
            Input.viewPos.y -= Input.speed;
        }
        if (Input.key[KEY_DOWN]) {
            Input.delta.y -= Input.speed;
            Input.viewPos.y += Input.speed;
        }

        Input.viewPos.x -= Input.delta.x * Input.speed;
        Input.delta.x -= (Input.delta.x / 20) * Input.speed;

        Input.viewPos.y -= Input.delta.y * Input.speed;
        Input.delta.y -= (Input.delta.y / 20) * Input.speed;
    },

    wheelAction: function (e) {
        Editor.map.tileSize += (e.deltaY / Math.abs(e.deltaY)) * 2;
    },

    rightClick: function (e) {
        e.preventDefault();
        return false;
    },


    inputUp: function (e) {
        if (e.button == 0) Input.mouse.left = false;
        if (e.button == 1) Input.mouse.middle = false;
        if (e.button == 2) Input.mouse.right = false;

        if (e.button == 0) {
            Editor.calculateShadows();
        }
    },

    inputDown: function (e) {
        Input.mouse.left = (e.button == 0);
        Input.mouse.middle = (e.button == 1);
        Input.mouse.right = (e.button == 2);
        Input.getPosition(Input.pos, e);
    },

    inputMove: function (e) {
        Input.getPosition(Input.pos, e);

    },

    inputKeyDown: function (e) {
        Input.key[e.keyCode] = true;
    },

    inputKeyUp: function (e) {
        Input.key[e.keyCode] = false;
    },

    getPosition: function (point, event) {
        if (event.touches) {
            Input.real.x = event.touches[0].pageX;
            Input.real.y = event.touches[0].pageY;
        }
        else {
            Input.real.x = event.pageX;
            Input.real.y = event.pageY;
        }

        point.x = Input.real.x * Graphics.ratio.x;
        point.y = (Input.real.y - Graphics.offset.y) * Graphics.ratio.y;
    },
};
