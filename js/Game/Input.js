"use strict";

var Input = {
    mouse: {
        left: false,
        middle: false,
        right: false,
        browser: { x: 0, y: 0 },
        x: 0,
        y: 0,
        mapX: 0,
        mapY: 0,
    },

    iner: 0,
    keyboard: { active: false },

    speed: .1,

    init: function () {
        window.addEventListener('mousedown', Input.inputDown);
        window.addEventListener('mouseup', Input.inputUp);
        window.addEventListener('mousemove', Input.inputMove);

        window.addEventListener('keyup', Input.keyHandler);
        window.addEventListener('keydown', Input.keyHandler);

        window.addEventListener('contextmenu', Input.rightClick);
        window.addEventListener('wheel', Input.wheelAction);

    },


    update: function () {
    },

    wheelAction: function (e) {
        tileSize += (e.deltaY / Math.abs(e.deltaY)) * 2;
    },

    rightClick: function (e) {
        e.preventDefault();
        return false;
    },


    inputUp: function (e) {
        if (e.button == 0) Input.mouse.left = false;
        if (e.button == 1) Input.mouse.middle = false;
        if (e.button == 2) Input.mouse.right = false;

        if (Editor) Editor.calculateShadows();

    },

    inputDown: function (e) {
        Input.mouse.left = (e.button == 0);
        Input.mouse.middle = (e.button == 1);
        Input.mouse.right = (e.button == 2);
        Input.getPosition(Input.mouse, e);
    },

    inputMove: function (e) {
        Input.getPosition(Input.mouse, e);

    },

    keyHandler: function (e) {
        Input.keyboard.active = (e.type == "keydown");
        Input.keyboard[e.key] = Input.keyboard.active;
    },


    getPosition: function (mouse, event) {
        mouse.browser.x = event.clientX;
        mouse.browser.y = event.clientY;

        mouse.x = mouse.browser.x * gfx.ratio.x;
        mouse.y = (mouse.browser.y - gfx.offset.y) * gfx.ratio.y;
    }
};
