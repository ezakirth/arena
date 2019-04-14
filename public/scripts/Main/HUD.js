"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require('jquery');
var HUD = /** @class */ (function () {
    function HUD() {
        this.HUD_score = document.createElement('div');
        this.HUD_score.id = 'HUD_score';
        this.HUD_log = document.createElement('div');
        this.HUD_log.id = 'HUD_log';
        this.HUD_ping = document.createElement('div');
        this.HUD_ping.id = 'HUD_ping';
        this.HUD_fullscreen = document.createElement('div');
        this.HUD_fullscreen.id = 'HUD_fullscreen';
        this.HUD_fullscreen.innerHTML = '[&nbsp;&nbsp;&nbsp;]';
        this.HUD_fullscreen.onclick = this.toggleFullScreen;
        document.body.appendChild(this.HUD_log);
        document.body.appendChild(this.HUD_ping);
        document.body.appendChild(this.HUD_fullscreen);
        document.body.appendChild(this.HUD_score);
    }
    HUD.prototype.updateScore = function () {
        var scores = [];
        for (var clientId in main.clients) {
            var client = main.clients[clientId];
            console.log(client.name);
            var kills = client.infos.score.kills;
            var deaths = client.infos.score.deaths;
            var captures = client.infos.score.captures;
            var returns = client.infos.score.returns;
            var total = 100 * kills + 300 * captures + 50 * returns - 25 * deaths;
            scores.push({ client: client, total: total, kills: kills, deaths: deaths, captures: captures, returns: returns });
        }
        scores = scores.sort(function (a, b) { return b.total - a.total; });
        // empty scoreboard
        while (this.HUD_score.firstChild) {
            this.HUD_score.removeChild(this.HUD_score.firstChild);
        }
        var rank = 1;
        for (var _i = 0, scores_1 = scores; _i < scores_1.length; _i++) {
            var score = scores_1[_i];
            var html = '<div class="inline"><div class="white">' + rank + '.</div> <div class="' + score.client.infos.team + 'Team">' + score.client.name + '</div>&nbsp;:&nbsp;&nbsp;<div class="white">' + score.total + '</div>';
            html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<div class="' + score.client.infos.enemyTeam + 'Team">' + score.kills + '</div><div class="kills"></div> ';
            html += '<div class="red">' + score.deaths + '</div><div class="deaths"></div>';
            html += '</div>';
            this.HUD_score.appendChild($(html)[0]);
            rank++;
        }
    };
    HUD.prototype.toggleFullScreen = function () {
        if (!document['fullscreenElement']) {
            document.documentElement.requestFullscreen();
        }
        else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };
    HUD.prototype.render = function () {
    };
    HUD.prototype.processMessages = function (broadcast) {
        var needUpdate = false;
        if (broadcast.joined)
            needUpdate = this.parseJoined(broadcast.joined);
        if (broadcast.left)
            needUpdate = this.parseLeft(broadcast.left);
        if (broadcast.combat)
            needUpdate = this.parseCombat(broadcast.combat);
        if (broadcast.flagAction)
            needUpdate = this.parseFlagAction(broadcast.flagAction);
        if (needUpdate) {
            this.updateScore();
        }
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
            this.HUD_log.appendChild(logMsg);
            this.addRemoveTimer(logMsg);
        }
        return true;
    };
    HUD.prototype.parseLeft = function (messages) {
        for (var _i = 0, messages_2 = messages; _i < messages_2.length; _i++) {
            var message = messages_2[_i];
            var logMsg = $('<p><span class="' + message.team + 'Team">' + message.name + '</span> has left the game !</p>')[0];
            this.HUD_log.appendChild(logMsg);
            this.addRemoveTimer(logMsg);
        }
        return true;
    };
    HUD.prototype.parseCombat = function (messages) {
        for (var _i = 0, messages_3 = messages; _i < messages_3.length; _i++) {
            var message = messages_3[_i];
            var logMsg = $('<p><span class="' + message.team + 'Team">' + message.name + '</span> has killed <span class="' + message.killedTeam + 'Team">' + message.killed + '</span> with a ' + message.weapon + ' !</p>')[0];
            this.HUD_log.appendChild(logMsg);
            this.addRemoveTimer(logMsg);
        }
        return true;
    };
    HUD.prototype.parseFlagAction = function (messages) {
        for (var _i = 0, messages_4 = messages; _i < messages_4.length; _i++) {
            var message = messages_4[_i];
            var logMsg = $('<p><span class="' + message.team + 'Team">' + message.name + '</span> has ' + message.action + ' the flag !</p>')[0];
            this.HUD_log.appendChild(logMsg);
            this.addRemoveTimer(logMsg);
        }
        return true;
    };
    return HUD;
}());
exports.default = HUD;
