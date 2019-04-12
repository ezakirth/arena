import Network from "./Network";
import Main from "./Main";

declare var main: Main;
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

        $('#clientName').on('click', function () {
            window.getSelection().removeAllRanges();
            $(this)[0].setSelectionRange(0, $(this).val().length)
        });

        $('#clientName').on('focus', function () {
            if (this.value == 'New player') this.value = '';
        });

        $('#clientName').on('blur', function () {
            if (this.value == '') this.value = 'New player';
        });
    }


    show() {
        let _this = this;

        main.lobbies.push({ empty: true, id: '' });
        $('.lobbyContainer').empty();

        for (let index = 0; index < main.lobbies.length; index++) {
            let lobby = main.lobbies[index];

            let type = lobby.gameType;
            if (type == "Capture The Flag") type = 'CTF';
            if (type == "Deathmatch") type = 'DM';
            if (type == "Team Deathmatch") type = 'Team DM';

            let elem = document.createElement('div');
            elem.className = 'itemLobby';
            if (lobby.empty)
                elem.innerHTML = 'Create Game';
            else
                elem.innerHTML = type + ' - ' + lobby.map + ' (' + lobby.current + '/' + lobby.max + ')';

            if (lobby.empty || lobby.current < lobby.max) {

                elem.onclick = function () {
                    $('.lobbyContainer').empty();

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
                    main.localClientName = name;

                    if (lobby.empty) {
                        _this.showGameTypes();
                        return;
                    }

                    main.lobbyId = lobby.id;
                    network.joinGame('');
                    _this.hide();

                };
            }

            $('.lobbyContainer').append(elem);
        }
        $('#Menu').css({ 'display': 'flex' });
    }

    hide() {
        $('#Menu').css({ 'display': 'none' });
    }

    showGameTypes() {
        $('.lobbyContainer').empty();
        let DM = $('<div class="itemLobby">Deathmatch (DM)</div>')[0];
        let TDM = $('<div class="itemLobby">Team Deathmatch (Team DM)</div>')[0];
        let CTF = $('<div class="itemLobby">Capture The Flag (CTF)</div>')[0];
        let back = $('<div class="itemLobby">Go back</div>')[0];

        let _this = this;
        DM.onclick = function () { _this.showMaps("Deathmatch"); };
        TDM.onclick = function () { _this.showMaps("Team Deathmatch"); };
        CTF.onclick = function () { _this.showMaps("Capture The Flag"); };
        back.onclick = function () { main.lobbies.pop(); _this.show() };

        $('.lobbyContainer').append(DM);
        $('.lobbyContainer').append(TDM);
        $('.lobbyContainer').append(CTF);
        $('.lobbyContainer').append(back);
    }

    showMaps(gameType) {
        $('.lobbyContainer').empty();
        let _this = this;
        for (let mapInfo of main.mapList) {
            if (mapInfo.gameType == gameType) {
                let type = mapInfo.gameType;
                if (type == "Capture The Flag") type = 'CTF';
                if (type == "Deathmatch") type = 'DM';
                if (type == "Team Deathmatch") type = 'Team DM';

                let mapDiv = $('<div class="itemLobby">' + type + ' - ' + mapInfo.name + ' (' + mapInfo.maxPlayers + ' players)' + '</div>')[0];
                mapDiv.onclick = function () {
                    $('.lobbyContainer').empty();
                    main.lobbyId = '';
                    network.joinGame(mapInfo.path);
                    _this.hide();
                }
                $('.lobbyContainer').append(mapDiv);
            }
        }
        let back = $('<div class="itemLobby">Go back</div>')[0];
        back.onclick = function () { _this.showGameTypes() };
        $('.lobbyContainer').append(back);

    }

}
