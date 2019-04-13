"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require('jquery');
var HUD = /** @class */ (function () {
    function HUD() {
        this.log = document.createElement('div');
        this.log.id = 'HUD';
        this.ping = document.createElement('div');
        this.ping.id = 'ping';
        document.body.appendChild(this.log);
        document.body.appendChild(this.ping);
    }
    HUD.prototype.render = function () {
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
    HUD.prototype.addRemoveTimer = function (logMsg) {
        window.setTimeout(function () {
            $(logMsg).animate({
                height: "0px",
                opacity: 0
            }, 500, function () {
                this.parentNode.removeChild(this);
            });
        }, 3000);
    };
    HUD.prototype.parseJoined = function (messages) {
        for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
            var message = messages_1[_i];
            var logMsg = $('<p><span class="' + message.team + 'Team">' + message.name + '</span> has joined the game !</p>')[0];
            this.log.appendChild(logMsg);
            this.addRemoveTimer(logMsg);
        }
    };
    HUD.prototype.parseLeft = function (messages) {
        for (var _i = 0, messages_2 = messages; _i < messages_2.length; _i++) {
            var message = messages_2[_i];
            var logMsg = $('<p><span class="' + message.team + 'Team">' + message.name + '</span> has left the game !</p>')[0];
            this.log.appendChild(logMsg);
            this.addRemoveTimer(logMsg);
        }
    };
    HUD.prototype.parseCombat = function (messages) {
        for (var _i = 0, messages_3 = messages; _i < messages_3.length; _i++) {
            var message = messages_3[_i];
            var logMsg = $('<p><span class="' + message.team + 'Team">' + message.name + '</span> has killed <span class="' + message.killedTeam + 'Team">' + message.killed + '</span> with a ' + message.weapon + ' !</p>')[0];
            this.log.appendChild(logMsg);
            this.addRemoveTimer(logMsg);
        }
    };
    HUD.prototype.parseFlagAction = function (messages) {
        for (var _i = 0, messages_4 = messages; _i < messages_4.length; _i++) {
            var message = messages_4[_i];
            var logMsg = $('<p><span class="' + message.team + 'Team">' + message.name + '</span> has ' + message.action + ' the flag !</p>')[0];
            this.log.appendChild(logMsg);
            this.addRemoveTimer(logMsg);
        }
    };
    return HUD;
}());
exports.default = HUD;
