"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UUIDV1 = require("uuid/v1");
var Lobby = /** @class */ (function () {
    function Lobby(map) {
        this.id = UUIDV1();
        this.clients = {};
        this.teams = { blue: [], green: [] };
        this.projectiles = [];
        this.newBullets = [];
        this.history = {};
        this.map = map;
    }
    return Lobby;
}());
exports.default = Lobby;
