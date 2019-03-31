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

    view: { x: 0, y: 0 },
    inertia: { x: 0, y: 0 },

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
        if (Input.keyboard.ArrowLeft) {
            Input.inertia.x += Input.speed;
            Input.view.x -= Input.speed;
        }
        if (Input.keyboard.ArrowRight) {
            Input.inertia.x -= Input.speed;
            Input.view.x += Input.speed;
        }

        if (Input.keyboard.ArrowUp) {
            Input.inertia.y += Input.speed;
            Input.view.y -= Input.speed;
        }
        if (Input.keyboard.ArrowDown) {
            Input.inertia.y -= Input.speed;
            Input.view.y += Input.speed;
        }

        Input.inertia.x -= (Input.inertia.x / 1.5) * Input.speed;
        Input.view.x -= Input.inertia.x * Input.speed;

        Input.inertia.y -= (Input.inertia.y / 1.5) * Input.speed;
        Input.view.y -= Input.inertia.y * Input.speed;
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

        // on annule la translation qu'on a fait pour l'affichage (voir drawTile)
        var offsetX = Input.view.x * Editor.map.tileSize;
        var offsetY = Input.view.y * Editor.map.tileSize;

        let mapX = Math.floor((mouse.x + offsetX) / Editor.map.tileSize);
        let mapY = Math.floor((mouse.y + offsetY) / Editor.map.tileSize);
        if (Editor.map.data[mapX] !== undefined && Editor.map.data[mapX][mapY] !== undefined) {
            Input.mapX = mapX;
            Input.mapY = mapY;
        }
    }
};
