"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UUIDV1 = require("uuid/v1");
var Broacast_1 = require("./Broacast");
var Lobby = /** @class */ (function () {
    function Lobby(map, mapId) {
        this.id = UUIDV1();
        this.mapId = mapId;
        this.clients = {};
        this.teams = { blue: [], green: [] };
        this.projectiles = [];
        this.newBullets = [];
        this.history = {};
        this.map = map;
        this.broadcast = new Broacast_1.default();
    }
    return Lobby;
}());
exports.default = Lobby;
