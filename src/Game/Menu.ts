import Network from "./Network";
import Game from "./Game";

declare var game: Game;
declare var network: Network;

var $ = require('jquery');

export default class Menu {
    elem: HTMLElement;
    lobbies: any[];
    constructor() {
        let _this = this;
        this.lobbies = [];

        let savedName = window.localStorage.getItem('ARENA_CLIENT_NAME');
        if (!savedName) savedName = 'New player';

        $('#clientName').val(savedName);

        $('#clientName').on('focus', function () {
            if (this.value == 'New player') this.value = '';
        });

        $('#clientName').on('blur', function () {
            if (this.value == '') this.value = 'New player';
        });


    }


    show() {
        let _this = this;

        game.lobbies.push({ empty: true, id: '' });
        $('.lobbyContainer').empty();

        for (let index = 0; index < game.lobbies.length; index++) {
            let lobby = game.lobbies[index];
            let elem = document.createElement('div');
            elem.className = 'itemLobby';
            if (lobby.empty)
                elem.innerHTML = 'Create Game';
            else
                elem.innerHTML = lobby.type + ' - ' + lobby.map + ' (' + lobby.current + '/' + lobby.max + ')';

            elem.onclick = function () {
                $('.lobbyContainer').empty();
                game.lobbyId = lobby.id;
                let text = $('#clientName').val();

                let div = document.createElement("div");
                div.innerHTML = text;
                let name = div.textContent || div.innerText || '';

                name = name.trim();

                if (name.length == 0) {
                    $('#clientName').val('New player');
                    return;
                }

                window.localStorage.setItem('ARENA_CLIENT_NAME', name);
                game.localClientName = name;

                network.joinGame();
                _this.hide();

            };

            $('.lobbyContainer').append(elem);
        }


        $('#Menu').css({ 'display': 'flex' });
    }

    hide() {
        $('#Menu').css({ 'display': 'none' });
    }
}
