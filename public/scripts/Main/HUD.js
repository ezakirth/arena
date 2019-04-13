"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require('jquery');
var HUD = /** @class */ (function () {
    function HUD() {
        this.elem = $('<div id="HUD"></div>')[0];
        this.log = '';
        $("body").append(this.elem);
    }
    HUD.prototype.render = function () {
        this.elem.innerHTML = this.log;
    };
    HUD.prototype.processMessages = function (broadcast) {
        if (broadcast.joined)
            this.parseJoined(broadcast.joined);
        if (broadcast.left)
            this.parseLeft(broadcast.left);
        if (broadcast.combat)
            this.parseCombat(broadcast.combat);
        if (broadcast.flagAction)
            this.parseFlagAction(broadcast.flagAction);
    };
    HUD.prototype.parseJoined = function (messages) {
        for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
            var message = messages_1[_i];
            this.log = '<p><span class="' + message.team + 'Team">' + message.name + '</span> joined the game !</p>';
        }
    };
    HUD.prototype.parseLeft = function (messages) {
        for (var _i = 0, messages_2 = messages; _i < messages_2.length; _i++) {
            var message = messages_2[_i];
            this.log = '<p><span class="' + message.team + 'Team">' + message.name + '</span> left the game !</p>';
        }
    };
    HUD.prototype.parseCombat = function (messages) {
        for (var _i = 0, messages_3 = messages; _i < messages_3.length; _i++) {
            var message = messages_3[_i];
            this.log = '<p><span class="' + message.team + 'Team">' + message.name + '</span> has killed ';
            this.log += '<span class="' + message.killedTeam + 'Team">' + message.killed + '</span> with a ' + message.weapon + '</p>';
        }
    };
    HUD.prototype.parseFlagAction = function (messages) {
        for (var _i = 0, messages_4 = messages; _i < messages_4.length; _i++) {
            var message = messages_4[_i];
            this.log = '<p><span class="' + message.team + 'Team">' + message.name + '</span> has ' + message.action + ' the flag !</p>';
        }
    };
    return HUD;
}());
exports.default = HUD;
