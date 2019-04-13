import Main from "./Main";
import Broadcast from "../server/Broacast";
var $ = require('jquery');


export default class HUD {
    elem: HTMLElement;
    log: string;
    constructor() {
        this.elem = $('<div id="HUD"></div>')[0];
        this.log = '';
        $("body").append(this.elem);
    }


    render() {
        this.elem.innerHTML = this.log;
    }

    processMessages(broadcast: Broadcast) {
        if (broadcast.joined) this.parseJoined(broadcast.joined);
        if (broadcast.left) this.parseLeft(broadcast.left);
        if (broadcast.combat) this.parseCombat(broadcast.combat);
        if (broadcast.flagAction) this.parseFlagAction(broadcast.flagAction);
    }

    parseJoined(messages) {
        for (let message of messages) {
            this.log = '<p><span class="' + message.team + 'Team">' + message.name + '</span> joined the game !</p>';
        }
    }

    parseLeft(messages) {
        for (let message of messages) {
            this.log = '<p><span class="' + message.team + 'Team">' + message.name + '</span> left the game !</p>';
        }

    }

    parseCombat(messages) {
        for (let message of messages) {
            this.log = '<p><span class="' + message.team + 'Team">' + message.name + '</span> has killed ';
            this.log += '<span class="' + message.killedTeam + 'Team">' + message.killed + '</span> with a ' + message.weapon + '</p>';
        }

    }
    parseFlagAction(messages) {
        for (let message of messages) {
            this.log = '<p><span class="' + message.team + 'Team">' + message.name + '</span> has ' + message.action + ' the flag !</p>';
        }

    }

}
