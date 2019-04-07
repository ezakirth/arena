(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Client_1 = require("./Client");
var Vector_1 = require("../common/Vector");
var initGame_1 = require("../initGame");
var Clientclientside = /** @class */ (function (_super) {
    __extends(Clientclientside, _super);
    function Clientclientside(name, clientId, team, position) {
        return _super.call(this, name, clientId, team, position) || this;
    }
    /**
     * Applies local input to the client
     */
    Clientclientside.prototype.applyInputs = function () {
        if (!this.dead) {
            this.direction = Vector_1.default._subtract(new Vector_1.default(gfx.width / 2, gfx.height / 2), new Vector_1.default(input.mouse.x, input.mouse.y)).normalize();
            this.dirSide = Vector_1.default._rotate(this.direction, Math.PI / 2);
            var oldX = this.position.x;
            var oldY = this.position.y;
            var oldPx = Math.floor(this.position.x);
            var oldPy = Math.floor(this.position.y);
            if (input.keyboard.ArrowLeft) {
                this.moving = true;
                this.position.add(this.dirSide.multiply(this.infos.speed));
            }
            if (input.keyboard.ArrowRight) {
                this.moving = true;
                this.position.subtract(this.dirSide.multiply(this.infos.speed));
            }
            if (input.keyboard.ArrowUp) {
                this.moving = true;
                this.position.subtract(this.direction.multiply(this.infos.speed));
            }
            if (input.keyboard.ArrowDown) {
                this.moving = true;
                this.position.add(this.direction.multiply(this.infos.speed));
            }
            this.position.x = initGame_1.clamp(this.position.x, 0, map.w - 1);
            this.position.y = initGame_1.clamp(this.position.y, 0, map.h - 1);
            var px = Math.floor(this.position.x);
            var py = Math.floor(this.position.y);
            if (map.data[oldPx][py].solid)
                this.position.y = oldY;
            if (map.data[px][oldPy].solid)
                this.position.x = oldX;
        }
    };
    /**
     * update the client position
     */
    Clientclientside.prototype.update = function () {
        this.moving = false;
        // if the client is the client, update position based on input
        if (this.networkData.clientId == game.localClientId) {
            this.applyInputs();
        }
        // if the client is not the client (coming from network), interpolate its positions
        else {
            this.interpolatePositions();
        }
        if (this.moving)
            this.frame += time.delta * 6;
        else
            this.frame = 1;
        if (this.frame >= 3)
            this.frame = 0;
    };
    Clientclientside.prototype.interpolatePositions = function () {
        // Find the two authoritative positions surrounding the rendering timestamp.
        var buffer = this.networkData.positionBuffer;
        // Drop positions older than 100ms.
        while (buffer.length >= 2 && buffer[1].timestamp <= time.networkData.renderTimestamp) {
            buffer.shift();
        }
        // Interpolate between the two surrounding authoritative positions.
        // startpoint is older than 100ms, endpoint is less than 100ms ago
        if (buffer.length >= 2 && buffer[0].timestamp <= time.networkData.renderTimestamp && buffer[1].timestamp >= time.networkData.renderTimestamp) {
            var x0 = buffer[0].position.x;
            var y0 = buffer[0].position.y;
            var dx0 = buffer[0].direction.x;
            var dy0 = buffer[0].direction.y;
            var t0 = buffer[0].timestamp;
            var x1 = buffer[1].position.x;
            var y1 = buffer[1].position.y;
            var dx1 = buffer[1].direction.x;
            var dy1 = buffer[1].direction.y;
            var t1 = buffer[1].timestamp;
            this.position.x = x0 + (x1 - x0) * (time.networkData.renderTimestamp - t0) / (t1 - t0);
            this.position.y = y0 + (y1 - y0) * (time.networkData.renderTimestamp - t0) / (t1 - t0);
            this.direction.x = dx0 + (dx1 - dx0) * (time.networkData.renderTimestamp - t0) / (t1 - t0);
            this.direction.y = dy0 + (dy1 - dy0) * (time.networkData.renderTimestamp - t0) / (t1 - t0);
            if (!(x0 == x1 && y0 == y1))
                this.moving = true;
        }
    };
    /**
     * Kills the client (drops flag if he was carrying)
     */
    Clientclientside.prototype.die = function () {
        if (this.infos.hasEnemyFlag) {
            var px = Math.floor(this.position.x);
            var py = Math.floor(this.position.y);
            map.queueUpdate('pickup', 'pickup_flag_' + this.infos.enemyTeam, px, py);
            this.infos.hasEnemyFlag = false;
        }
        this.dead = true;
    };
    /**
     * Renders the client and his view of the map
     * first map pass renders the floor, decals, spawn and portals
     * second map pass renders walls, shadows and pickups
     */
    Clientclientside.prototype.renderLocal = function () {
        // first pass
        map.renderView(this.position, 1);
        this.renderCharacter();
        // render network clients
        for (var clientId in game.clients) {
            if (clientId != game.localClientId) {
                game.clients[clientId].renderNetworkClientCharacter();
            }
        }
        // second pass
        map.renderView(this.position, 2);
        this.renderStats();
        // render network clients' stats
        for (var clientId in game.clients) {
            if (clientId != game.localClientId) {
                game.clients[clientId].renderNetworkClientStats();
            }
        }
    };
    Clientclientside.prototype.renderNetworkClientCharacter = function () {
        gfx.pushMatrix();
        var offsetX = (this.position.x * tileSize - game.clients[game.localClientId].position.x * tileSize);
        var offsetY = (this.position.y * tileSize - game.clients[game.localClientId].position.y * tileSize);
        gfx.translate(offsetX, offsetY);
        this.renderCharacter();
        gfx.popMatrix();
    };
    Clientclientside.prototype.renderNetworkClientStats = function () {
        gfx.pushMatrix();
        var offsetX = (this.position.x * tileSize - game.clients[game.localClientId].position.x * tileSize);
        var offsetY = (this.position.y * tileSize - game.clients[game.localClientId].position.y * tileSize);
        gfx.translate(offsetX, offsetY);
        this.renderStats();
        gfx.popMatrix();
    };
    /**
     * Displays the character
     */
    Clientclientside.prototype.renderCharacter = function () {
        var ang = Math.atan2(this.direction.y, this.direction.x);
        gfx.pushMatrix();
        gfx.translate(gfx.width / 2, gfx.height / 2);
        gfx.rotate(ang - Math.PI / 2);
        gfx.sprite("shadow", 0, 0, tileSize, tileSize);
        gfx.spriteSheet("toon_" + this.infos.team, 320 / 3 * Math.floor(this.frame), 0, 320 / 3, 210, 0, 0, tileSize * ((320 / 3) / 210), tileSize);
        gfx.popMatrix();
    };
    /**
     * Displays all the client stats (name, life, shield)
     */
    Clientclientside.prototype.renderStats = function () {
        var lifeVal = 100;
        var life = (tileSize / 2) / 100 * this.infos.life + 0.1;
        var shield = (tileSize / 2) / 100 * this.infos.shield + 0.1;
        if (this.infos.life < 100)
            lifeVal = 75;
        if (this.infos.life < 75)
            lifeVal = 50;
        if (this.infos.life < 50)
            lifeVal = 25;
        if (this.infos.life < 25)
            lifeVal = 0;
        gfx.pushMatrix();
        gfx.translate(gfx.width / 2, gfx.height / 2);
        gfx.sprite('stat_life_' + lifeVal, 0, -55, life, 8);
        gfx.sprite('stat_shield', 0, -45, shield, 8);
        gfx.drawText(this.infos.name, 0, -68);
        gfx.popMatrix();
    };
    return Clientclientside;
}(Client_1.default));
exports.default = Clientclientside;

},{"../common/Vector":11,"../initGame":12,"./Client":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector_1 = require("../common/Vector");
var Pickups_1 = require("../common/Pickups");
/**
 * Handles a client
 * @param {string} name
 */
var Client = /** @class */ (function () {
    function Client(name, clientId, team, position) {
        this.direction = new Vector_1.default(1, 0);
        this.position = new Vector_1.default(position.x, position.y);
        this.infos = {
            name: name,
            life: 100,
            shield: 100,
            weapon: Pickups_1.Pickups.weapons.gun,
            ammo: 10,
            speed: 0.05,
            hasEnemyFlag: false,
            team: team,
            enemyTeam: (team == 'green' ? 'blue' : 'green')
        };
        this.networkData = {
            clientId: clientId,
            lastPosition: { x: this.position.x, y: this.position.y, dx: this.direction.x, dy: this.direction.y },
            sequence: 0,
            forceNoReconciliation: false,
            positionBuffer: [],
            pendingMovement: []
        };
        this.justUsedPortal = false;
        this.dead = false;
        this.moving = false;
        this.frame = 1;
    }
    return Client;
}());
exports.default = Client;

},{"../common/Pickups":8,"../common/Vector":11}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game = /** @class */ (function () {
    function Game() {
        this.clients = {};
        this.localClientId = null;
        this.localClient = null;
    }
    Game.prototype.update = function () {
        for (var clientId in this.clients) {
            this.clients[clientId].update();
        }
    };
    Game.prototype.render = function () {
        gfx.clear();
        gfx.sprite("bg", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);
        if (this.localClient)
            this.localClient.renderLocal();
        gfx.sprite("vignette", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);
    };
    return Game;
}());
exports.default = Game;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import * as io from '/socket.io/socket.io.js';
//import * as io from 'socket.io-client';
var Client_clientside_1 = require("./Client.clientside");
var Network = /** @class */ (function () {
    function Network() {
    }
    Network.prototype.constuctor = function () {
        this.latency = 0;
        this.lastServerTimestamp = 0;
        this.socket = null;
    };
    Network.prototype.init = function () {
        this.socket = io(); //'http://localhost:3000');
        var _this = this;
        /*
        setInterval(function () {
            _this.startTime = Date.now();
            _this.socket.emit('pingtest');
        }, 2000);
        this.socket.on('pongtest', function () {
            _this.latency = Date.now() - _this.startTime;
             document.getElementById('ping').innerText = _this.latency + 'ms';
        });
        */
        setInterval(function () {
            var client = game.clients[game.localClientId];
            if (client) {
                _this.sendMovementData(client);
            }
        }, 100);
        // Connected to the server
        this.socket.on('init', function (serverData) {
            _this.createClient(serverData);
        });
        // disconnected to the server
        this.socket.on('disconnected', function (clientId) {
            _this.deleteClient(clientId);
        });
        // updates from the server
        this.socket.on('update', function (data) {
            _this.updateClient(data);
        });
    };
    /**
     * Load map from server and add local client
     * @param {*} serverData
     * @param {*} callback
     */
    Network.prototype.createClient = function (serverData) {
        var client = serverData.client;
        var mapData = serverData.map;
        map.parseMap(mapData);
        game.localClientId = client.networkData.clientId;
        game.localClient = game.clients[game.localClientId] = new Client_clientside_1.default('Local client', game.localClientId, client.infos.team, client.position);
    };
    Network.prototype.deleteClient = function (clientId) {
        delete game.clients[clientId];
    };
    Network.prototype.updateClient = function (data) {
        this.lastServerTimestamp = data.timestamp;
        map.updates = data.mapUpdates;
        map.processUpdates();
        var serverClients = data.clients;
        for (var clientId in serverClients) {
            var serverClient = serverClients[clientId];
            if (!game.clients[clientId]) {
                game.clients[clientId] = new Client_clientside_1.default('Network client ' + Object.keys(game.clients).length, serverClient.networkData.clientId, serverClient.infos.team, serverClient.position);
            }
            var client = game.clients[clientId];
            if (clientId == game.localClientId) {
                // if there was movement since the last server update, send it now
                if (serverClient.networkData.forceNoReconciliation)
                    client.networkData.pendingMovement = [];
                else
                    this.sendMovementData(client);
                this.authoring(client, serverClient);
                this.reconciliation(client, serverClient);
            }
            else {
                this.clientsPositionBuffer(client, serverClient);
            }
        }
    };
    /**
     * Apply the authoritative position of this client's client.
     * @param {*} client
     * @param {*} serverClient
     */
    Network.prototype.authoring = function (client, serverClient) {
        client.position.x = serverClient.position.x;
        client.position.y = serverClient.position.y;
        client.direction.x = serverClient.direction.x;
        client.direction.y = serverClient.direction.y;
        client.infos = serverClient.infos;
        client.infos.name = 'local';
        if (serverClient.networkData.forceNoReconciliation) {
            client.networkData.lastPosition.x = client.position.x;
            client.networkData.lastPosition.y = client.position.y;
        }
    };
    /**
     * Server Reconciliation. Re-apply all the inputs not yet processed by the server.
     * @param {*} client
     * @param {*} serverClient
     */
    Network.prototype.reconciliation = function (client, serverClient) {
        var j = 0;
        while (j < client.networkData.pendingMovement.length) {
            var movementData = client.networkData.pendingMovement[j];
            if (movementData.sequence <= serverClient.networkData.sequence) {
                // Already processed. Its effect is already taken into account into the world update
                // we just got, so we can drop it.
                client.networkData.pendingMovement.splice(j, 1);
            }
            else {
                client.position.x += movementData.movement.x;
                client.position.y += movementData.movement.y;
                client.direction.x += movementData.movement.dx;
                client.direction.y += movementData.movement.dy;
                j++;
            }
        }
    };
    /**
     * Add the position of non local clients to the position buffer.
     * @param {*} client
     * @param {*} serverClient
     */
    Network.prototype.clientsPositionBuffer = function (client, serverClient) {
        var timestamp = +new Date();
        time.setServerDelay(timestamp);
        if (serverClient.networkData.forceNoReconciliation) {
            client.networkData.positionBuffer = [];
            client.networkData.positionBuffer.push({ timestamp: timestamp - 1, position: serverClient.position, direction: serverClient.direction });
            client.position.x = serverClient.position.x;
            client.position.y = serverClient.position.y;
        }
        else
            client.networkData.positionBuffer.push({ timestamp: timestamp, position: serverClient.position, direction: serverClient.direction });
    };
    Network.prototype.sendMovementData = function (client) {
        // get movement since last one sent to server
        var deltaPosition = {
            x: client.position.x - client.networkData.lastPosition.x,
            y: client.position.y - client.networkData.lastPosition.y,
            dx: client.direction.x - client.networkData.lastPosition.dx,
            dy: client.direction.y - client.networkData.lastPosition.dy,
        };
        // If there was movement, notify the server
        if (Math.abs(deltaPosition.x) + Math.abs(deltaPosition.y) + Math.abs(deltaPosition.dx) + Math.abs(deltaPosition.dy) > 0) {
            client.networkData.lastPosition = { x: client.position.x, y: client.position.y, dx: client.direction.x, dy: client.direction.y };
            // send movement to server for validation
            var movementData = { movement: deltaPosition, sequence: ++client.networkData.sequence };
            this.socket.emit('update', movementData);
            // store movements for later reconciliation
            client.networkData.pendingMovement.push(movementData);
        }
    };
    return Network;
}());
exports.default = Network;
//var socket = io('https://charpie.herokuapp.com/');

},{"./Client.clientside":1}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector_1 = require("./Vector");
var Graphics = /** @class */ (function () {
    function Graphics() {
        this.width = 1920;
        this.height = 1080;
        this.browser = { width: 1920, height: 1080 };
        this.offset = new Vector_1.default(0, 0);
        this.ratio = new Vector_1.default(0, 0);
        this.cachedImages = {};
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext("2d");
        document.body.appendChild(this.canvas);
    }
    Graphics.prototype.init = function () {
        var _this = this;
        this.resizeCanvas();
        window.onresize = function () { _this.resizeCanvas(); };
    };
    Graphics.prototype.getWidth = function () {
        return this.ctx.canvas.width;
    };
    Graphics.prototype.getHeight = function () {
        return this.ctx.canvas.height;
    };
    Graphics.prototype.setStyles = function () {
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.strokeStyle = "black";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.font = "bold 28px Impact";
    };
    Graphics.prototype.resizeCanvas = function () {
        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;
        this.ratio.x = this.width / this.canvas.clientWidth;
        this.ratio.y = this.height / this.canvas.clientHeight;
        this.offset.y = (window.innerHeight - this.canvas.clientHeight) / 2;
        this.setStyles();
        this.browser.height = window.innerHeight;
        this.browser.width = window.innerWidth;
    };
    Graphics.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    Graphics.prototype.sprite = function (img, x, y, w, h) {
        img = './assets/' + img + '.png';
        var image = this.cachedImages[img];
        if (!image) {
            this.cachedImages[img] = new Image(256, 256);
            image = this.cachedImages[img];
            image.src = img;
        }
        else {
            var width = w || image.naturalWidth;
            var height = h || image.naturalHeight;
            this.ctx.drawImage(image, x - width / 2, y - height / 2, width, height);
        }
    };
    Graphics.prototype.drawText = function (text, x, y) {
        this.ctx.fillText(text, x, y);
        this.ctx.strokeText(text, x, y);
    };
    Graphics.prototype.spriteSheet = function (img, sx, sy, sw, sh, dx, dy, dw, dh) {
        img = './assets/' + img + '.png';
        var image = this.cachedImages[img];
        if (!image) {
            this.cachedImages[img] = new Image(256, 256);
            image = this.cachedImages[img];
            image.src = img;
        }
        else {
            this.ctx.drawImage(image, sx, sy, sw, sh, dx - dw / 2, dy - dh / 2, dw, dh);
        }
    };
    Graphics.prototype.rotate = function (angle) {
        this.ctx.rotate(angle); // * Math.PI / 180);
    };
    Graphics.prototype.pushMatrix = function () {
        this.ctx.save();
    };
    Graphics.prototype.popMatrix = function () {
        this.ctx.restore();
    };
    Graphics.prototype.translate = function (x, y) {
        this.ctx.translate(x, y);
    };
    return Graphics;
}());
exports.default = Graphics;

},{"./Vector":11}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector_1 = require("./Vector");
var initGame_1 = require("../initGame");
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
        this.view.x = initGame_1.clamp(this.view.x, 0, map.w - 5);
        this.view.y = initGame_1.clamp(this.view.y, 0, map.h);
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

},{"../initGame":12,"./Vector":11}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector_1 = require("./Vector");
var Tile_1 = require("./Tile");
var Map = /** @class */ (function () {
    function Map() {
        this.data = null;
        this.spawns = { blue: [], green: [] };
        this.flags = { blue: null, green: null };
        // updates from server that are to be processed
        this.updates = [];
    }
    /**
     * Sets up the map in editor mode
     * @param w
     * @param h
     * @param forceNew
     */
    Map.prototype.init = function (w, h, forceNew) {
        this.w = w;
        this.h = h;
        this.data = JSON.parse(localStorage.getItem('tileData'));
        if (!this.data || forceNew) {
            this.data = Array(this.w);
            for (var x = 0; x < this.w; x++) {
                this.data[x] = Array(this.h);
                for (var y = 0; y < this.h; y++) {
                    this.data[x][y] = new Tile_1.default();
                }
            }
        }
        this.w = this.data.length;
        this.h = this.data[0].length;
        document.getElementById("#editor_Width_id")['value'] = this.w;
        document.getElementById("#editor_Height_id")['value'] = this.h;
    };
    /**
     * Server method: adds an update to the queue
     * @param type
     * @param value
     * @param x
     * @param y
     */
    Map.prototype.queueUpdate = function (type, value, x, y) {
        this.updates.push({ type: type, value: value, x: x, y: y });
    };
    /**
     * Client method: processes the update queue
     */
    Map.prototype.processUpdates = function () {
        for (var _i = 0, _a = this.updates; _i < _a.length; _i++) {
            var update = _a[_i];
            var tile = this.data[update.x][update.y];
            tile[update.type] = update.value;
        }
        this.updates = [];
    };
    /**
     * Pick a random spawn point for a client
     * @param {string} team
     */
    Map.prototype.assignSpawnToClient = function (team) {
        var spawnPoint = this.spawns[team][Math.floor(Math.random() * this.spawns[team].length)];
        return new Vector_1.default(spawnPoint.x, spawnPoint.y);
    };
    /**
     * Loads the map
     * @param {Object} data
     */
    Map.prototype.parseMap = function (data) {
        this.data = data;
        this.w = this.data.length;
        this.h = this.data[0].length;
        for (var x = 0; x < this.w; x++) {
            for (var y = 0; y < this.h; y++) {
                var block = this.data[x][y];
                if (block.pickup == "pickup_flag_blue") {
                    this.flags.blue = new Vector_1.default(x, y);
                }
                if (block.pickup == "pickup_flag_green") {
                    this.flags.green = new Vector_1.default(x, y);
                }
                if (block.spawn == "spawn_blue") {
                    this.spawns.blue.push(new Vector_1.default(x + 0.5, y + 0.5));
                }
                if (block.spawn == "spawn_green") {
                    this.spawns.green.push(new Vector_1.default(x + 0.5, y + 0.5));
                }
            }
        }
        ;
    };
    /**
     * Render the map based on position
     * first pass renders the floor, decals, spawn and portals
     * second pass renders walls, shadows and pickups
     * @param {vector2} view
     * @param {integer} pass
     */
    Map.prototype.renderView = function (view, pass) {
        var block = null;
        var viewSizeX = Math.ceil((gfx.width / 2) / tileSize);
        var viewSizeY = Math.ceil((gfx.height / 2) / tileSize);
        var pMapX = Math.floor(view.x);
        var pMapY = Math.floor(view.y);
        gfx.pushMatrix();
        gfx.translate(gfx.width / 2 + tileSize / 2 - view.x * tileSize, gfx.height / 2 + tileSize / 2 - view.y * tileSize);
        // on boucle sur toutes les tiles autour du joueur
        for (var x = pMapX - viewSizeX; x < pMapX + viewSizeX + 1; x++) {
            for (var y = pMapY - viewSizeY - 1; y < pMapY + viewSizeY + 1; y++) {
                if (x < this.w && y < this.h && x >= 0 && y >= 0) {
                    block = this.data[x][y];
                    var px = x * tileSize;
                    var py = y * tileSize;
                    // first pass: render floor, decals, spawn and portals
                    if (!pass || pass == 1) {
                        if (block.tex && !block.solid) {
                            gfx.sprite(block.tex, px, py, tileSize, tileSize);
                        }
                        if (block.decals) {
                            for (var i = 0; i < block.decals.length; i++) {
                                gfx.sprite(block.decals[i], px, py, tileSize, tileSize);
                            }
                        }
                        if (block.spawn) {
                            gfx.sprite(block.spawn, px, py, tileSize - time.morphs.smallfast, tileSize - time.morphs.smallfast);
                        }
                        if (block.portal) {
                            gfx.pushMatrix();
                            gfx.translate(px, py);
                            gfx.rotate(time.elapsed / 10 * Math.PI / 180);
                            gfx.sprite("portal_" + block.portal.color, 0, 0, tileSize - time.morphs.bigslow, tileSize - time.morphs.bigslow);
                            gfx.popMatrix();
                        }
                    }
                    // second pass: render walls, shadows and pickups
                    if (!pass || pass == 2) {
                        if (block.tex && block.solid) {
                            gfx.sprite(block.tex, px, py, tileSize, tileSize);
                        }
                        if (block.shadow) {
                            gfx.sprite(block.shadow, px, py, tileSize, tileSize);
                        }
                        if (block.pickup) {
                            gfx.sprite("light", px, py, tileSize - time.morphs.bigfast, tileSize - time.morphs.bigfast);
                            gfx.sprite(block.pickup, px, py, tileSize - time.morphs.smallslow, tileSize - time.morphs.smallslow);
                        }
                        if (block.flag) {
                            gfx.sprite("light", px, py, tileSize - time.morphs.bigfast, tileSize - time.morphs.bigfast);
                            gfx.sprite(block.flag, px, py, tileSize - time.morphs.smallslow, tileSize - time.morphs.smallslow);
                        }
                    }
                    if (Editor && Editor.showGrid) {
                        if (block.solid) {
                            gfx.sprite("red", px, py, tileSize, tileSize);
                        }
                        else {
                            gfx.sprite("green", px, py, tileSize, tileSize);
                        }
                    }
                }
            }
        }
        gfx.popMatrix();
    };
    /**
     * Resets the map (Editor method)
     */
    Map.prototype.resetData = function () {
        var w = parseInt(document.getElementById("#editor_Width_id")['value']);
        var h = parseInt(document.getElementById("#editor_Height_id")['value']);
        this.init(w, h, true);
    };
    return Map;
}());
exports.default = Map;

},{"./Tile":9,"./Vector":11}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pickups = {
    buffs: {
        medkit: {
            type: 'buff',
            name: 'medkit',
            life: 30,
            shield: 0,
            speed: 0
        },
        shield: {
            type: 'buff',
            name: 'shield',
            life: 0,
            shield: 25,
            speed: 0
        },
        speed: {
            type: 'buff',
            name: 'speed',
            life: 0,
            shield: 0,
            speed: 0.05
        }
    },
    flags: {
        flag_blue: {
            type: 'flag',
            name: 'flag_blue'
        },
        flag_green: {
            type: 'flag',
            name: 'flag_green'
        }
    },
    weapons: {
        gun: {
            type: 'weapon',
            name: 'gun',
            dmg: 20,
            rate: 0.4,
            speed: 10,
            range: 500,
            ammo: 1 / 0,
            weight: 1.0
        },
        minigun: {
            type: 'weapon',
            name: 'minigun',
            dmg: 8,
            rate: 0.1,
            speed: 15,
            range: 800,
            ammo: 60,
            weight: 2.0
        },
        blastgun: {
            type: 'weapon',
            name: 'blastgun',
            dmg: 15,
            rate: 0.2,
            speed: 10,
            range: 1000,
            ammo: 60,
            weight: 2.5
        },
        railgun: {
            type: 'weapon',
            name: 'railgun',
            dmg: 150,
            rate: 2,
            speed: 40,
            range: 1000,
            ammo: 5,
            weight: 3
        },
        shotgun: {
            type: 'weapon',
            name: 'shotgun',
            dmg: 10,
            rate: 1.5,
            speed: 10,
            range: 300,
            ammo: 15,
            weight: 1.5
        },
        rpg: {
            type: 'weapon',
            name: 'rpg',
            dmg: 100,
            rate: 1,
            speed: 10,
            range: 3000,
            ammo: 10,
            weight: 3
        }
    }
};

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Tile = /** @class */ (function () {
    function Tile() {
        // true if not walkable, else false
        this.solid = true;
        // contains a list of decal texture names
        this.decals = [];
    }
    return Tile;
}());
exports.default = Tile;

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Timer = /** @class */ (function () {
    function Timer() {
        this.now = +new Date();
        this.last = this.now;
        this.delta = 0;
        this.elapsed = 0;
        this.morphs = {};
        this.timers = [];
        this.networkData = {
            renderTimestamp: 0,
            serverDelay: 100,
            serverUpdateTimeStamps: [],
            serverUpdateDelay: 0,
            lastServerUpdate: 0,
        };
    }
    Timer.prototype.update = function () {
        this.now = +new Date();
        this.delta = (this.now - this.last) / 1000.0;
        this.last = this.now;
        this.elapsed += this.delta;
        this.checkTimers();
        this.updateMorphs();
        this.networkUpdate();
    };
    Timer.prototype.updateMorphs = function () {
        this.morphs.bigfast = Math.abs(Math.sin(this.elapsed * 8) * 20);
        this.morphs.bigslow = Math.abs(Math.sin(this.elapsed * 4) * 20);
        this.morphs.smallfast = Math.abs(Math.sin(this.elapsed * 8) * 10);
        this.morphs.smallslow = Math.abs(Math.sin(this.elapsed * 4) * 10);
    };
    /**
     * Goes through all items to be respawned and respawn them if the delay has expired
     */
    Timer.prototype.checkTimers = function () {
        for (var index = this.timers.length - 1; index >= 0; index--) {
            var timer = this.timers[index];
            timer.delay -= this.delta;
            if (timer.delay <= 0) {
                if (timer.type == 'respawn') {
                    map.queueUpdate('pickup', timer.data.pickup, timer.data.x, timer.data.y);
                }
                if (timer.type == 'buff') {
                    timer.data.client.infos[timer.data.stat] = timer.data.value;
                }
                this.timers.splice(index, 1);
            }
        }
    };
    /**
     * Adds a pickup to the list of respawn timers
     * @param {string} type
     * @param {number} delay
     * @param {Object} info
     */
    Timer.prototype.addTimer = function (type, delay, data) {
        this.timers.push({ type: type, delay: delay, data: data });
    };
    Timer.prototype.networkUpdate = function () {
        this.networkData.renderTimestamp = this.now + this.networkData.serverUpdateDelay;
        this.networkData.lastServerUpdate += this.delta;
    };
    Timer.prototype.setServerDelay = function (timestamp) {
        this.networkData.serverUpdateTimeStamps.push(timestamp);
        if (this.networkData.serverUpdateTimeStamps.length > 2)
            this.networkData.serverUpdateTimeStamps.shift();
        this.networkData.serverUpdateDelay = this.networkData.serverUpdateTimeStamps[0] - this.networkData.serverUpdateTimeStamps[1];
    };
    return Timer;
}());
exports.default = Timer;

},{}],11:[function(require,module,exports){
"use strict";
/*
Simple 2D JavaScript Vector Class
Hacked from evanw's lightgl.js
https://github.com/evanw/lightgl.js/blob/master/src/static _js
*/
Object.defineProperty(exports, "__esModule", { value: true });
var Vector = /** @class */ (function () {
    function Vector(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    /* INSTANCE METHODS */
    Vector.prototype.negative = function () {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    };
    Vector.prototype.add = function (v) {
        if (v instanceof Vector) {
            this.x += v.x;
            this.y += v.y;
        }
        else {
            this.x += v;
            this.y += v;
        }
        return this;
    };
    Vector.prototype.subtract = function (v) {
        if (v instanceof Vector) {
            this.x -= v.x;
            this.y -= v.y;
        }
        else {
            this.x -= v;
            this.y -= v;
        }
        return this;
    };
    Vector.prototype.multiply = function (v) {
        if (v instanceof Vector) {
            this.x *= v.x;
            this.y *= v.y;
        }
        else {
            this.x *= v;
            this.y *= v;
        }
        return this;
    };
    Vector.prototype.divide = function (v) {
        if (v instanceof Vector) {
            if (v.x != 0)
                this.x /= v.x;
            if (v.y != 0)
                this.y /= v.y;
        }
        else {
            if (v != 0) {
                this.x /= v;
                this.y /= v;
            }
        }
        return this;
    };
    Vector.prototype.equals = function (v) {
        return this.x == v.x && this.y == v.y;
    };
    Vector.prototype.dot = function (v) {
        return this.x * v.x + this.y * v.y;
    };
    Vector.prototype.cross = function (v) {
        return this.x * v.y - this.y * v.x;
    };
    Vector.prototype.length = function () {
        return Math.sqrt(this.dot(this));
    };
    Vector.prototype.normalize = function () {
        return this.divide(this.length());
    };
    Vector.prototype.min = function () {
        return Math.min(this.x, this.y);
    };
    Vector.prototype.max = function () {
        return Math.max(this.x, this.y);
    };
    Vector.prototype.toAngles = function () {
        return -Math.atan2(-this.y, this.x);
    };
    Vector.prototype.angleTo = function (a) {
        return Math.acos(this.dot(a) / (this.length() * a.length()));
    };
    Vector.prototype.toArray = function (n) {
        return [this.x, this.y].slice(0, n || 2);
    };
    Vector.prototype.clone = function () {
        return new Vector(this.x, this.y);
    };
    Vector.prototype.set = function (x, y) {
        this.x = x;
        this.y = y;
        return this;
    };
    Vector.prototype.rotate = function (angle) {
        var nx = (this.x * Math.cos(angle)) - (this.y * Math.sin(angle));
        var ny = (this.x * Math.sin(angle)) + (this.y * Math.cos(angle));
        this.x = nx;
        this.y = ny;
        return this;
    };
    /* STATIC METHODS */
    Vector._negative = function (v) {
        return new Vector(-v.x, -v.y);
    };
    Vector._add = function (a, b) {
        if (b instanceof Vector)
            return new Vector(a.x + b.x, a.y + b.y);
        else
            return new Vector(a.x + b, a.y + b);
    };
    Vector._subtract = function (a, b) {
        if (b instanceof Vector)
            return new Vector(a.x - b.x, a.y - b.y);
        else
            return new Vector(a.x - b, a.y - b);
    };
    Vector._multiply = function (a, b) {
        if (b instanceof Vector)
            return new Vector(a.x * b.x, a.y * b.y);
        else
            return new Vector(a.x * b, a.y * b);
    };
    Vector._divide = function (a, b) {
        if (b instanceof Vector)
            return new Vector(a.x / b.x, a.y / b.y);
        else
            return new Vector(a.x / b, a.y / b);
    };
    Vector._equals = function (a, b) {
        return a.x == b.x && a.y == b.y;
    };
    Vector._dot = function (a, b) {
        return a.x * b.x + a.y * b.y;
    };
    Vector._cross = function (a, b) {
        return a.x * b.y - a.y * b.x;
    };
    Vector._rotate = function (vec, angle) {
        var v = new Vector(vec.x, vec.y);
        var nx = (v.x * Math.cos(angle)) - (v.y * Math.sin(angle));
        var ny = (v.x * Math.sin(angle)) + (v.y * Math.cos(angle));
        v.x = nx;
        v.y = ny;
        return v;
    };
    return Vector;
}());
exports.default = Vector;

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = function (num, min, max) { return Math.min(Math.max(num, min), max); };
var Map_1 = require("./common/Map");
var Graphics_1 = require("./common/Graphics");
var Input_1 = require("./common/Input");
var Timer_1 = require("./common/Timer");
var Game_1 = require("./Game/Game");
var Network_1 = require("./Game/Network");
window.tileSize = 128;
window.Editor = null;
window.gfx = new Graphics_1.default();
window.time = new Timer_1.default();
window.map = new Map_1.default();
window.input = new Input_1.default();
window.network = new Network_1.default();
window.game = new Game_1.default();
var loop = function () {
    requestAnimationFrame(loop);
    window.time.update();
    if (window.game.localClient) {
        // logic
        window.game.update();
        // graphics
        window.game.render();
    }
};
window.gfx.init();
window.input.init();
// attempts to connect to the server.
// once connected, server sends us the map data and our client info
window.network.init();
loop();

},{"./Game/Game":3,"./Game/Network":4,"./common/Graphics":5,"./common/Input":6,"./common/Map":7,"./common/Timer":10}]},{},[12]);
