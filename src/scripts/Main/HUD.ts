import Timer from '../common/Timer';
import Broadcast from '../server/Broacast';
import Main from '../Main/Main';
var $ = require('jquery');

declare var time: Timer;
declare var main: Main;

export default class HUD {
    HUD_log: HTMLDivElement;
    HUD_ping: HTMLDivElement;
    HUD_score: HTMLDivElement;
    HUD_fullscreen: HTMLDivElement;

    constructor() {
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

    updateScore() {
        let scores = [];
        for (let clientId in main.clients) {
            let client = main.clients[clientId];

            let kills = client.infos.score.kills;
            let deaths = client.infos.score.deaths;
            let captures = client.infos.score.captures;
            let returns = client.infos.score.returns;
            let total = 100 * kills + 300 * captures + 50 * returns - 25 * deaths;

            scores.push({ client: client, total: total, kills: kills, deaths: deaths, captures: captures, returns: returns });
        }
        scores = scores.sort((a, b) => b.total - a.total);

        // empty scoreboard
        while (this.HUD_score.firstChild) {
            this.HUD_score.removeChild(this.HUD_score.firstChild);
        }

        let rank = 1;
        for (let score of scores) {
            let html = '<div class="inline"><div class="white">' + rank + '.</div> <div class="' + score.client.infos.team + 'Team">' + score.client.name + '</div>&nbsp;:&nbsp;&nbsp;<div class="white">' + score.total + '</div>';
            html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<div class="' + score.client.infos.enemyTeam + 'Team">' + score.kills + '</div><div class="kills"></div> ';
            html += '<div class="red">' + score.deaths + '</div><div class="deaths"></div>'
            html += '</div>';
            this.HUD_score.appendChild($(html)[0]);
            rank++;
        }

    }


    toggleFullScreen() {
        if (!document['fullscreenElement']) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    render() {

    }

    processMessages(broadcast: Broadcast) {
        let needUpdate = false;
        if (broadcast.joined) needUpdate = this.parseJoined(broadcast.joined);
        if (broadcast.left) needUpdate = this.parseLeft(broadcast.left);
        if (broadcast.combat) needUpdate = this.parseCombat(broadcast.combat);
        if (broadcast.flagAction) needUpdate = this.parseFlagAction(broadcast.flagAction);

        if (needUpdate) {
            this.updateScore();
        }
    }

    addRemoveTimer(logMsg) {
        window.setTimeout(function () {
            $(logMsg).animate({
                height: "0px",
                opacity: 0
            }, 500, function () {
                this.parentNode.removeChild(this);
            });
        }, 3000);
    }

    parseJoined(messages) {
        for (let message of messages) {
            let logMsg = $('<p><span class="' + message.team + 'Team">' + message.name + '</span> has joined the game !</p>')[0];
            this.HUD_log.appendChild(logMsg);
            this.addRemoveTimer(logMsg);
        }
        return true;
    }

    parseLeft(messages) {
        for (let message of messages) {
            let logMsg = $('<p><span class="' + message.team + 'Team">' + message.name + '</span> has left the game !</p>')[0];
            this.HUD_log.appendChild(logMsg);
            this.addRemoveTimer(logMsg);
        }
        return true;
    }

    parseCombat(messages) {
        for (let message of messages) {
            let logMsg = $('<p><span class="' + message.team + 'Team">' + message.name + '</span> has killed <span class="' + message.killedTeam + 'Team">' + message.killed + '</span> with a ' + message.weapon + ' !</p>')[0];
            this.HUD_log.appendChild(logMsg);
            this.addRemoveTimer(logMsg);
        }
        return true;
    }
    parseFlagAction(messages) {
        for (let message of messages) {
            let logMsg = $('<p><span class="' + message.team + 'Team">' + message.name + '</span> has ' + message.action + ' the flag !</p>')[0];
            this.HUD_log.appendChild(logMsg);
            this.addRemoveTimer(logMsg);
        }
        return true;
    }

}
