import Network from "./Network";
import Main from "./Main";
import Map from "../Map/Map";

declare var main: Main;
declare var map: Map;
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
        $('#Menu').css({ 'display': 'flex' });
    }

    hide() {
        $('#Menu').css({ 'display': 'none' });
    }

    showLobbies() {
        let _this = this;

        main.lobbies.push({ empty: true, id: '' });
        $('.lobbyContainer').empty();

        for (let index = 0; index < main.lobbies.length; index++) {
            let lobby = main.lobbies[index];

            let type = lobby.gameType;
            if (type == "Capture The Flag") type = 'CTF';
            if (type == "Free For All") type = 'FFA';
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
                        _this.showGameTypes(main.mapList, main);
                        return;
                    }

                    main.lobbyId = lobby.id;
                    network.askToJoin(lobby.mapId);
                    _this.hide();

                };
            }

            $('.lobbyContainer').append(elem);
        }
        this.show();
    }


    showGameTypes(mapList, main) {
        $('.lobbyContainer').empty();
        let _this = this;

        let FFA = $('<div class="itemLobby">Free For All (FFA)</div>')[0];
        FFA.onclick = function () { _this.showMaps(mapList, "Free For All", main); };
        $('.lobbyContainer').append(FFA);

        let TDM = $('<div class="itemLobby">Team Deathmatch (Team DM)</div>')[0];
        TDM.onclick = function () { _this.showMaps(mapList, "Team Deathmatch", main); };
        $('.lobbyContainer').append(TDM);

        let CTF = $('<div class="itemLobby">Capture The Flag (CTF)</div>')[0];
        CTF.onclick = function () { _this.showMaps(mapList, "Capture The Flag", main); };
        $('.lobbyContainer').append(CTF);

        if (main) {
            let back = $('<div class="itemLobby">Go back</div>')[0];
            back.onclick = function () { main.lobbies.pop(); _this.show() };
            $('.lobbyContainer').append(back);
        }
    }

    showMaps(mapList, gameType, main) {
        $('.lobbyContainer').empty();
        let _this = this;
        for (let mapInfo of mapList) {
            if (mapInfo.gameType == gameType) {
                let type = mapInfo.gameType;
                if (type == "Capture The Flag") type = 'CTF';
                if (type == "Free For All") type = 'FFA';
                if (type == "Team Deathmatch") type = 'Team DM';

                let mapDiv = $('<div class="itemLobby">' + type + ' - ' + mapInfo.name + ' (' + mapInfo.maxPlayers + ' players)' + '</div>')[0];
                mapDiv.onclick = function () {
                    $('.lobbyContainer').empty();
                    if (main) {
                        main.lobbyId = '';
                        network.askToJoin(mapInfo.id);
                    }
                    else {
                        let data = {
                            name: mapInfo.name,
                            gameType: mapInfo.gameType,
                            maxPlayers: mapInfo.maxPlayers,
                            mapData: mapInfo.mapData,
                            width: mapInfo.width,
                            height: mapInfo.height
                        };

                        let gameTypeVal = $('#editor_Game_type_id option').filter(function () {
                            return $(this).text() === data.gameType;
                        }).val();

                        $("#editor_Game_type_id").val(gameTypeVal);
                        $("#editor_Max_players_id").val(data.maxPlayers);
                        $("#editor_Width_id").val(data.width);
                        $("#editor_Height_id").val(data.height);
                        $("#editor_Name_id").val(data.name);

                        map.parseMap(data);
                    }
                    _this.hide();
                }
                $('.lobbyContainer').append(mapDiv);
            }
        }
        let back = $('<div class="itemLobby">Go back</div>')[0];
        back.onclick = function () { _this.showGameTypes(mapList, null) };
        $('.lobbyContainer').append(back);

    }

}
