import Timer from '../common/Timer';
import Broadcast from "../server/Broacast";
var $ = require('jquery');

declare var time: Timer;

export default class HUD {
    log: HTMLDivElement;
    ping: HTMLDivElement;
    constructor() {
        this.log = document.createElement('div');
        this.log.id = 'HUD';

        this.ping = document.createElement('div');
        this.ping.id = 'ping';

        document.body.appendChild(this.log);
        document.body.appendChild(this.ping);
    }


    render() {

    }

    processMessages(broadcast: Broadcast) {
        if (broadcast.joined) this.parseJoined(broadcast.joined);
        if (broadcast.left) this.parseLeft(broadcast.left);
        if (broadcast.combat) this.parseCombat(broadcast.combat);
        if (broadcast.flagAction) this.parseFlagAction(broadcast.flagAction);
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
            this.log.appendChild(logMsg);
            this.addRemoveTimer(logMsg);
        }


    }

    parseLeft(messages) {
        for (let message of messages) {
            let logMsg = $('<p><span class="' + message.team + 'Team">' + message.name + '</span> has left the game !</p>')[0];
            this.log.appendChild(logMsg);
            this.addRemoveTimer(logMsg);
        }

    }

    parseCombat(messages) {
        for (let message of messages) {
            let logMsg = $('<p><span class="' + message.team + 'Team">' + message.name + '</span> has killed <span class="' + message.killedTeam + 'Team">' + message.killed + '</span> with a ' + message.weapon + ' !</p>')[0];
            this.log.appendChild(logMsg);
            this.addRemoveTimer(logMsg);
        }

    }
    parseFlagAction(messages) {
        for (let message of messages) {
            let logMsg = $('<p><span class="' + message.team + 'Team">' + message.name + '</span> has ' + message.action + ' the flag !</p>')[0];
            this.log.appendChild(logMsg);
            this.addRemoveTimer(logMsg);
        }

    }

}
