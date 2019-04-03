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

    speed: 0.1,

    init: function () {
        window.addEventListener('mousedown', Input.inputDown);
        window.addEventListener('mouseup', Input.inputUp);
        window.addEventListener('mousemove', Input.inputMove);

        document.addEventListener('touchstart', Input.inputDown);
        document.addEventListener('touchend', Input.inputUp);
        document.addEventListener('touchmove', Input.inputMove);

        window.addEventListener('keyup', Input.keyHandler);
        window.addEventListener('keydown', Input.keyHandler);

        window.addEventListener('contextmenu', Input.rightClick);
        window.addEventListener('wheel', Input.wheelAction);

    },


    update: function () {
        Input.updateMapPosition();


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


        if (Input.mouse.browser.x > gfx.browser.width - 30) Input.view.x += time.delta * 10;
        if (Input.mouse.browser.x < 30) Input.view.x -= time.delta * 10;
        if (Input.mouse.browser.y > gfx.browser.height - 30) Input.view.y += time.delta * 10;
        if (Input.mouse.browser.y < 30) Input.view.y -= time.delta * 10;

        // make sure we don't lose sight of the map ^^
        Input.view.x = Input.view.x.clamp(0, map.w - 5);
        Input.view.y = Input.view.y.clamp(0, map.h);

    },

    wheelAction: function (e) {
        tileSize += (e.deltaY / Math.abs(e.deltaY)) * 2;
    },

    rightClick: function (e) {
        e.preventDefault();
        return false;
    },

    inputUp: function (e) {
        Input.mouse.active = false;
        if (e.button == 0) Input.mouse.left = false;
        if (e.button == 1) Input.mouse.middle = false;
        if (e.button == 2) Input.mouse.right = false;
        Input.getPosition(Input.mouse, e);
        if (Editor) Editor.calculateShadows();
    },

    inputDown: function (e) {
        Input.mouse.active = true;
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
        let x, y;

        if (event.touches) {
            x = (event.touches[0] ? event.touches[0].pageX : Input.mouse.browser.x);
            y = (event.touches[0] ? event.touches[0].pageY : Input.mouse.browser.y);
            Input.keyboard.ArrowUp = Input.mouse.active;
        }
        else {
            x = event.clientX;
            y = event.clientY;
        }

        mouse.browser.x = x;
        mouse.browser.y = y;

        mouse.x = mouse.browser.x * gfx.ratio.x;
        mouse.y = (mouse.browser.y - gfx.offset.y) * gfx.ratio.y;
    },

    updateMapPosition: function () {
        // on annule la translation qu'on a fait pour l'affichage (voir drawTile)
        var offsetX = Input.view.x * tileSize - gfx.width / 2;
        var offsetY = Input.view.y * tileSize - gfx.height / 2;

        Input.mouse.mapX = Math.floor((Input.mouse.x + offsetX) / tileSize);
        Input.mouse.mapY = Math.floor((Input.mouse.y + offsetY) / tileSize);
    }
};
