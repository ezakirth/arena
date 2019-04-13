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
        var _this = this;
        main.lobbies.push({ empty: true, id: '' });
        $('.lobbyContainer').empty();
        var _loop_1 = function (index) {
            var lobby = main.lobbies[index];
            var type = lobby.gameType;
            if (type == "Capture The Flag")
                type = 'CTF';
            if (type == "Deathmatch")
                type = 'DM';
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
                        _this.showGameTypes();
                        return;
                    }
                    main.lobbyId = lobby.id;
                    network.joinGame('');
                    _this.hide();
                };
            }
            $('.lobbyContainer').append(elem);
        };
        for (var index = 0; index < main.lobbies.length; index++) {
            _loop_1(index);
        }
        $('#Menu').css({ 'display': 'flex' });
    };
    Menu.prototype.hide = function () {
        $('#Menu').css({ 'display': 'none' });
    };
    Menu.prototype.showGameTypes = function () {
        $('.lobbyContainer').empty();
        var DM = $('<div class="itemLobby">Deathmatch (DM)</div>')[0];
        var TDM = $('<div class="itemLobby">Team Deathmatch (Team DM)</div>')[0];
        var CTF = $('<div class="itemLobby">Capture The Flag (CTF)</div>')[0];
        var back = $('<div class="itemLobby">Go back</div>')[0];
        var _this = this;
        DM.onclick = function () { _this.showMaps("Deathmatch"); };
        TDM.onclick = function () { _this.showMaps("Team Deathmatch"); };
        CTF.onclick = function () { _this.showMaps("Capture The Flag"); };
        back.onclick = function () { main.lobbies.pop(); _this.show(); };
        $('.lobbyContainer').append(DM);
        $('.lobbyContainer').append(TDM);
        $('.lobbyContainer').append(CTF);
        $('.lobbyContainer').append(back);
    };
    Menu.prototype.showMaps = function (gameType) {
        $('.lobbyContainer').empty();
        var _this = this;
        var _loop_2 = function (mapInfo) {
            if (mapInfo.gameType == gameType) {
                var type = mapInfo.gameType;
                if (type == "Capture The Flag")
                    type = 'CTF';
                if (type == "Deathmatch")
                    type = 'DM';
                if (type == "Team Deathmatch")
                    type = 'Team DM';
                var mapDiv = $('<div class="itemLobby">' + type + ' - ' + mapInfo.name + ' (' + mapInfo.maxPlayers + ' players)' + '</div>')[0];
                mapDiv.onclick = function () {
                    $('.lobbyContainer').empty();
                    main.lobbyId = '';
                    network.joinGame(mapInfo.path);
                    _this.hide();
                };
                $('.lobbyContainer').append(mapDiv);
            }
        };
        for (var _i = 0, _a = main.mapList; _i < _a.length; _i++) {
            var mapInfo = _a[_i];
            _loop_2(mapInfo);
        }
        var back = $('<div class="itemLobby">Go back</div>')[0];
        back.onclick = function () { _this.showGameTypes(); };
        $('.lobbyContainer').append(back);
    };
    return Menu;
}());
exports.default = Menu;
