"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require('jquery');
var Menu = /** @class */ (function () {
    function Menu() {
        var _this = this;
        this.lobbies = [];
        var savedName = window.localStorage.getItem('ARENA_CLIENT_NAME');
        if (!savedName)
            savedName = 'New player';
        $('#clientName').val(savedName);
        $('#clientName').on('click', function () {
            window.getSelection().removeAllRanges();
            $(this)[0].setSelectionRange(0, $(this).val().length);
        });
        $('#clientName').on('focus', function () {
            if (this.value == 'New player')
                this.value = '';
        });
        $('#clientName').on('blur', function () {
            if (this.value == '')
                this.value = 'New player';
        });
    }
    Menu.prototype.show = function () {
        $('#Menu').css({ 'display': 'flex' });
    };
    Menu.prototype.hide = function () {
        $('#Menu').css({ 'display': 'none' });
    };
    Menu.prototype.showLobbies = function () {
        var _this = this;
        main.lobbies.push({ empty: true, id: '' });
        $('.lobbyContainer').empty();
        var _loop_1 = function (index) {
            var lobby = main.lobbies[index];
            var type = lobby.gameType;
            if (type == "Capture The Flag")
                type = 'CTF';
            if (type == "Free For All")
                type = 'FFA';
            if (type == "Team Deathmatch")
                type = 'Team DM';
            var elem = document.createElement('div');
            elem.className = 'itemLobby';
            if (lobby.empty)
                elem.innerHTML = 'Create Game';
            else
                elem.innerHTML = type + ' - ' + lobby.map + ' (' + lobby.current + '/' + lobby.max + ')';
            if (lobby.empty || lobby.current < lobby.max) {
                elem.onclick = function () {
                    $('.lobbyContainer').empty();
                    var text = $('#clientName').val();
                    var div = document.createElement("div");
                    div.innerHTML = text;
                    var name = div.textContent || div.innerText || '';
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
        };
        for (var index = 0; index < main.lobbies.length; index++) {
            _loop_1(index);
        }
        this.show();
    };
    Menu.prototype.showGameTypes = function (mapList, main) {
        $('.lobbyContainer').empty();
        var _this = this;
        var FFA = $('<div class="itemLobby">Free For All (FFA)</div>')[0];
        FFA.onclick = function () { _this.showMaps(mapList, "Free For All", main); };
        $('.lobbyContainer').append(FFA);
        var TDM = $('<div class="itemLobby">Team Deathmatch (Team DM)</div>')[0];
        TDM.onclick = function () { _this.showMaps(mapList, "Team Deathmatch", main); };
        $('.lobbyContainer').append(TDM);
        var CTF = $('<div class="itemLobby">Capture The Flag (CTF)</div>')[0];
        CTF.onclick = function () { _this.showMaps(mapList, "Capture The Flag", main); };
        $('.lobbyContainer').append(CTF);
        if (main) {
            var back = $('<div class="itemLobby">Go back</div>')[0];
            back.onclick = function () { main.lobbies.pop(); _this.show(); };
            $('.lobbyContainer').append(back);
        }
    };
    Menu.prototype.showMaps = function (mapList, gameType, main) {
        $('.lobbyContainer').empty();
        var _this = this;
        var _loop_2 = function (mapInfo) {
            if (mapInfo.gameType == gameType) {
                var type = mapInfo.gameType;
                if (type == "Capture The Flag")
                    type = 'CTF';
                if (type == "Free For All")
                    type = 'FFA';
                if (type == "Team Deathmatch")
                    type = 'Team DM';
                var mapDiv = $('<div class="itemLobby">' + type + ' - ' + mapInfo.name + ' (' + mapInfo.maxPlayers + ' players)' + '</div>')[0];
                mapDiv.onclick = function () {
                    $('.lobbyContainer').empty();
                    if (main) {
                        main.lobbyId = '';
                        network.askToJoin(mapInfo.id);
                    }
                    else {
                        var data_1 = {
                            name: mapInfo.name,
                            gameType: mapInfo.gameType,
                            maxPlayers: mapInfo.maxPlayers,
                            mapData: mapInfo.mapData,
                            width: mapInfo.width,
                            height: mapInfo.height
                        };
                        var gameTypeVal = $('#editor_Game_type_id option').filter(function () {
                            return $(this).text() === data_1.gameType;
                        }).val();
                        $("#editor_Game_type_id").val(gameTypeVal);
                        $("#editor_Max_players_id").val(data_1.maxPlayers);
                        $("#editor_Width_id").val(data_1.width);
                        $("#editor_Height_id").val(data_1.height);
                        $("#editor_Name_id").val(data_1.name);
                        map.parseMap(data_1);
                    }
                    _this.hide();
                };
                $('.lobbyContainer').append(mapDiv);
            }
        };
        for (var _i = 0, mapList_1 = mapList; _i < mapList_1.length; _i++) {
            var mapInfo = mapList_1[_i];
            _loop_2(mapInfo);
        }
        var back = $('<div class="itemLobby">Go back</div>')[0];
        back.onclick = function () { _this.showGameTypes(mapList, null); };
        $('.lobbyContainer').append(back);
    };
    return Menu;
}());
exports.default = Menu;
