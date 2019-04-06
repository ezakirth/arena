window.$ = require('../../lib/jquery-3.3.1.min');

module.exports = Editor = {
    active: true,
    elem: null,
    showGrid: true,

    portalOrigin: null,

    init: function () {
        map.init(20, 20);

        input.view = { x: map.w / 2, y: map.h / 2 };
        this.menuSetup();

    },


    /**
     * Saves the map to a json file (Editor method)
     */
    saveData: function (data, filename) {
        var json = JSON.stringify(data);
        localStorage.setItem('tileData', json);

        var blob = new Blob([json], { type: "octet/stream" });
        var url = window.URL.createObjectURL(blob);

        var a = document.createElement('a');
        document.body.append(a);
        a.href = url;
        a.download = filename;
        a.click();
        $(a).remove();
        window.URL.revokeObjectURL(url);
    },

    /**
     * Loads the json file into the map (Editor method)
     */
    loadData: function (e) {
        if (e.target.files[0]) {
            var tmppath = URL.createObjectURL(e.target.files[0]);
            $.getJSON(tmppath, function (data) {
                map.parseMap(data);
                $("#editor_Width_id").val(map.w);
                $("#editor_Height_id").val(map.h);
            });
        }
    },


    /**
     * perform user interactions with the map
     */
    update: function () {
        if (input.mouse.browser.x > 276) {
            let px = input.mouse.mapX;
            let py = input.mouse.mapY;

            if (!(map.data[px] !== undefined && map.data[px][py] !== undefined)) return;

            let selected = $("#editor_Brush_type_id").val();

            if (selected == "Smart Paint") {
                if (input.mouse.left) this.paint(px, py);
                if (input.mouse.right) this.clear(px, py);
            }
            else {
                if (input.mouse.left) {
                    if (selected == "Add Spawn") this.addPickup("spawn_" + $("#editor_Spawn_team_id").val(), px, py);
                    if (selected == "Add Flag (CTF)") this.addPickup("flag_" + $("#editor_Flag_team_id").val(), px, py);
                    if (selected == "Add Weapons") this.addPickup($("#editor_Weapon_id").val(), px, py);
                    if (selected == "Add Pickups") this.addPickup($("#editor_Pickup_id").val(), px, py);
                    if (selected == "Add Portals") this.addPortal($("#editor_Portal_id").val(), px, py);
                }
                if (input.mouse.right) {
                    if (selected == "Add Portals")
                        this.clearPortal(px, py);
                    else
                        this.clearPickup(px, py);
                }
            }
        }

    },

    /**
     * Renders the map
     */
    render: function () {
        gfx.clear();

        gfx.sprite("bg", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);
        map.renderView(input.view);
        gfx.sprite("vignette", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);
    },

    /**
     * remove decals
     */
    removeDecal: function (type) {
        for (var x = 0; x < map.w; x++) {
            for (var y = 0; y < map.h; y++) {
                var tile = map.data[x][y];

                if (tile.tex && tile.tex.startsWith('floor')) {
                    for (var i = tile.decals.length - 1; i >= 0; i--) {
                        if (Math.random() > 0.5 && tile.decals[i].startsWith(type)) {
                            tile.decals.splice(i, 1);
                        }
                    }
                }
            }
        }
    },

    /**
     * add decals
     */
    addDecal: function (type) {
        for (var x = 0; x < map.w; x++) {
            for (var y = 0; y < map.h; y++) {
                var tile = map.data[x][y];

                if (tile.tex && tile.tex.startsWith('floor')) {
                    if (Math.random() > 0.95) {
                        tile.decals.push(type + '_' + Math.floor(Math.random() * 6 + 1));
                    }
                }
            }
        }
    },

    /**
     * add random decals to the floor on the map
     */
    randomDecals: function () {
        for (var x = 0; x < map.w; x++) {
            for (var y = 0; y < map.h; y++) {
                var tile = map.data[x][y];

                if (tile.tex && tile.tex.startsWith('floor')) {
                    tile.decals = [];
                    if (Math.random() > 0.90) {
                        tile.decals.push('blood_' + Math.floor(Math.random() * 6 + 1));
                    }
                    if (Math.random() > 0.90) {
                        tile.decals.push('dirt_' + Math.floor(Math.random() * 6 + 1));
                    }
                }
            }
        }
    },

    /**
     * calculate all shadows on the map
     */
    calculateShadows: function () {
        for (var x = 0; x < map.w; x++) {
            for (var y = 0; y < map.h; y++) {
                var tile = map.data[x][y];
                if (tile.tex && tile.tex.startsWith('floor')) {
                    tile.shadow = null;
                    var pCL = { x: (x - 1).clamp(0, map.w - 1), y: y };
                    var pBL = { x: (x - 1).clamp(0, map.w - 1), y: (y + 1).clamp(0, map.h - 1) };
                    var pBC = { x: x, y: (y + 1).clamp(0, map.h - 1) };

                    var CL = map.data[pCL.x][pCL.y];
                    var BL = map.data[pBL.x][pBL.y];
                    var BC = map.data[pBC.x][pBC.y];

                    if (CL.solid && BC.solid) tile.shadow = 'shadow_1';
                    else if (!BL.solid && BC.solid) tile.shadow = 'shadow_2';
                    else if (!BL.solid && !BC.solid && CL.solid) tile.shadow = 'shadow_3';
                    else if (BL.solid && BC.solid && !CL.solid) tile.shadow = 'shadow_4';
                    else if (CL.solid && BL.solid && !BC.solid) tile.shadow = 'shadow_5';
                    else if (BL.solid && !CL.solid && !BC.solid) tile.shadow = 'shadow_6';

                }
            }
        }
    },


    /**
     * Add a pickup or spawn location to the map
     */
    addPickup: function (type, px, py) {
        var tile = map.data[px][py];
        if (tile.solid || tile.portal || tile.spawn) return;

        if (type.startsWith('spawn')) {
            tile.spawn = type;
        }
        // use matching pickup floor texture (has shadow of the pickup)
        else {
            tile.tex = 'floor_' + type;
            tile.pickup = "pickup_" + type;
        }
        input.mouse.left = false;
    },

    /**
     * Removes pickup (item or spawn location)
     */
    clearPickup: function (px, py) {
        var tile = map.data[px][py];

        tile.spawn = null;
        if (tile.pickup) {
            // reapply basic floor texture
            this.randomFloorTile(tile);
            tile.pickup = null;
        }
        input.mouse.right = false;
    },

    /**
     * Adds a portal to the map (in two steps: origin then destination)
     */
    addPortal: function (type, px, py) {
        var tile = map.data[px][py];
        if (tile.solid || tile.pickup || tile.portal || tile.spawn) return;

        // if we have an origin for this portal (meaning this is the destination), link them together
        if (this.portalOrigin) {
            tile.portal = {
                color: this.portalOrigin.color,
                dx: this.portalOrigin.x,
                dy: this.portalOrigin.y
            };

            map.data[this.portalOrigin.x][this.portalOrigin.y].portal = {
                color: this.portalOrigin.color,
                dx: px,
                dy: py
            }

            this.portalOrigin = null;
        }
        // else this is the portal origin, addit and save origin info for later
        else {
            tile.portal = {
                color: type,
                dx: px,
                dy: py
            };

            this.portalOrigin = {
                color: type,
                x: px,
                y: py
            }
        }


        input.mouse.left = false;
    },


    /**
     * Remove portal origin and destination
     */
    clearPortal: function (px, py) {
        var tile = map.data[px][py];

        if (tile.portal) {
            map.data[tile.portal.dx][tile.portal.dy].portal = null;
            tile.portal = null;
            this.portalOrigin = null;
        }
        input.mouse.left = false;
    },

    /**
     * Fills the map floor with random floor tiles
     */
    randomFloor: function () {
        for (var x = 0; x < map.w; x++) {
            for (var y = 0; y < map.h; y++) {
                var tile = map.data[x][y];
                if (tile.tex && tile.tex.startsWith('floor')) {
                    if (tile.pickup) continue;
                    this.randomFloorTile(tile);
                }
            }
        }
    },

    /**
     * Paints a random floor tile
     */
    randomFloorTile: function (tile) {
        tile.tex = 'floor_1';
        if (Math.random() > 0.7) tile.tex = 'floor_' + Math.floor(Math.random() * 12 + 1);
    },

    clearTile: function (tile, tex) {
        tile.tex = tex;
        tile.solid = true;
        tile.shadow = null;
        tile.decals = [];
        tile.spawn = null;
        tile.pickup = null;
        if (tile.portal) {
            map.data[tile.portal.dx][tile.portal.dy].portal = null;
            tile.portal = null;
            this.portalOrigin = null;
        }
    },

    /**
     * Paints the map with floor and attempt to match surrounding tiles
     */
    paint: function (px, py) {
        var tile = map.data[px][py];
        tile.solid = false;

        if (!(tile.tex && tile.tex.startsWith('floor'))) {
            this.randomFloorTile(tile);
        }

        var pTL = { x: (px - 1).clamp(0, map.w - 1), y: (py - 1).clamp(0, map.h - 1) };
        var pTC = { x: px, y: (py - 1).clamp(0, map.h - 1) };
        var pTC2 = { x: px, y: (py - 2).clamp(0, map.h - 1) };
        var pTR = { x: (px + 1).clamp(0, map.w - 1), y: (py - 1).clamp(0, map.h - 1) };

        var pCL = { x: (px - 1).clamp(0, map.w - 1), y: py };
        var pCL2 = { x: (px - 2).clamp(0, map.w - 1), y: py };
        var pCR = { x: (px + 1).clamp(0, map.w - 1), y: py };
        var pCR2 = { x: (px + 2).clamp(0, map.w - 1), y: py };

        var pBL = { x: (px - 1).clamp(0, map.w - 1), y: (py + 1).clamp(0, map.h - 1) };
        var pBC = { x: px, y: (py + 1).clamp(0, map.h - 1) };
        var pBC2 = { x: px, y: (py + 2).clamp(0, map.h - 1) };
        var pBR = { x: (px + 1).clamp(0, map.w - 1), y: (py + 1).clamp(0, map.h - 1) };

        var TL = map.data[pTL.x][pTL.y];
        var TC = map.data[pTC.x][pTC.y];
        var TC2 = map.data[pTC2.x][pTC2.y];
        var TR = map.data[pTR.x][pTR.y];

        var CL = map.data[pCL.x][pCL.y];
        var CL2 = map.data[pCL2.x][pCL2.y];
        var CR = map.data[pCR.x][pCR.y];
        var CR2 = map.data[pCR2.x][pCR2.y];

        var BL = map.data[pBL.x][pBL.y];
        var BC = map.data[pBC.x][pBC.y];
        var BC2 = map.data[pBC2.x][pBC2.y];
        var BR = map.data[pBR.x][pBR.y];

        if (TL.solid && TL.tex == null) TL.tex = 'wall_TL';
        if (BL.solid && BL.tex == null) BL.tex = 'wall_BL';
        if (TR.solid && TR.tex == null) TR.tex = 'wall_TR';
        if (BR.solid && BR.tex == null) BR.tex = 'wall_BR';

        if (TC.solid) {
            TC.tex = 'wall_T';
            if (!TL.solid) TC.tex = 'wall_TRC';
            if (!TR.solid) TC.tex = 'wall_TLC';
            if (!TC2.solid || (!TL.solid && !TR.solid)) TC.tex = 'wall_1';
        }

        if (CL.solid) {
            CL.tex = 'wall_L';
            if (!TL.solid) CL.tex = 'wall_BLC';
            if (!BL.solid) CL.tex = 'wall_TLC';
            if (!CL2.solid || (!TL.solid && !BL.solid)) CL.tex = 'wall_1';
        }

        if (BC.solid) {
            BC.tex = 'wall_B';
            if (!BR.solid) BC.tex = 'wall_BLC';
            if (!BL.solid) BC.tex = 'wall_BRC';
            if (!BC2.solid || (!BL.solid && !BR.solid)) BC.tex = 'wall_1';
        }

        if (CR.solid) {
            CR.tex = 'wall_R';
            if (!TR.solid) CR.tex = 'wall_BRC';
            if (!BR.solid) CR.tex = 'wall_TRC';
            if (!CR2.solid || (!TR.solid && !BR.solid)) CR.tex = 'wall_1';
        }

        if (BL.tex == 'wall_TR') BL.tex = 'wall_join_TR';
        if (TR.tex == 'wall_BL') TR.tex = 'wall_join_TR';
        if (BR.tex == 'wall_TL') BR.tex = 'wall_join_TL';
        if (TL.tex == 'wall_BR') TL.tex = 'wall_join_TL';

        if (TL.tex == 'wall_BL') TL.tex = 'wall_L';
        if (BL.tex == 'wall_TL') BL.tex = 'wall_L';
        if (TR.tex == 'wall_BR') TR.tex = 'wall_R';
        if (BR.tex == 'wall_TR') BR.tex = 'wall_R';
    },


    /**
     * Clears the map at location and attemps to match surrounding tiles
     */
    clear: function (px, py) {
        var tile = map.data[px][py];

        var pTL = { x: (px - 1).clamp(0, map.w - 1), y: (py - 1).clamp(0, map.h - 1) };
        var pTC = { x: px, y: (py - 1).clamp(0, map.h - 1) };
        var pTR = { x: (px + 1).clamp(0, map.w - 1), y: (py - 1).clamp(0, map.h - 1) };

        var pCL = { x: (px - 1).clamp(0, map.w - 1), y: py };
        var pCR = { x: (px + 1).clamp(0, map.w - 1), y: py };

        var pBL = { x: (px - 1).clamp(0, map.w - 1), y: (py + 1).clamp(0, map.h - 1) };
        var pBC = { x: px, y: (py + 1).clamp(0, map.h - 1) };
        var pBR = { x: (px + 1).clamp(0, map.w - 1), y: (py + 1).clamp(0, map.h - 1) };

        var TL = map.data[pTL.x][pTL.y];
        var TC = map.data[pTC.x][pTC.y];
        var TR = map.data[pTR.x][pTR.y];

        var CL = map.data[pCL.x][pCL.y];
        var CR = map.data[pCR.x][pCR.y];

        var BL = map.data[pBL.x][pBL.y];
        var BC = map.data[pBC.x][pBC.y];
        var BR = map.data[pBR.x][pBR.y];

        this.clearTile(tile, null);

        if (!TL.solid) this.clearTile(TL, 'wall_BRC');
        if (!TC.solid) this.clearTile(TC, 'wall_B');
        if (!TR.solid) this.clearTile(TR, 'wall_BLC');
        if (!CL.solid) this.clearTile(CL, 'wall_R');
        if (!CR.solid) this.clearTile(CR, 'wall_L');
        if (!BL.solid) this.clearTile(BL, 'wall_TRC');
        if (!BC.solid) this.clearTile(BC, 'wall_T');
        if (!BR.solid) this.clearTile(BR, 'wall_TLC');

        if (['wall_BLC', 'wall_BRC', 'wall_TLC', 'wall_TRC'].includes(TC.tex)) TC.tex = 'wall_B';
        if (['wall_BLC', 'wall_BRC', 'wall_TLC', 'wall_TRC'].includes(BC.tex)) BC.tex = 'wall_T';
        if (['wall_BLC', 'wall_BRC', 'wall_TLC', 'wall_TRC'].includes(CL.tex)) CL.tex = 'wall_R';
        if (['wall_BLC', 'wall_BRC', 'wall_TLC', 'wall_TRC'].includes(CR.tex)) CR.tex = 'wall_L';

        if (BR.tex == 'wall_TRC') BR.tex = 'wall_T';
        if (BL.tex == 'wall_TLC') BL.tex = 'wall_T';
        if (TL.tex == 'wall_BLC') TL.tex = 'wall_B';
        if (TR.tex == 'wall_BRC') TR.tex = 'wall_B';

        if (BR.tex == 'wall_BLC') BR.tex = 'wall_L';
        if (BL.tex == 'wall_BRC') BL.tex = 'wall_R';
        if (TL.tex == 'wall_TRC') TL.tex = 'wall_R';
        if (TR.tex == 'wall_TLC') TR.tex = 'wall_L';

        if (TC.tex == 'wall_L') {
            TC.tex = 'wall_B';
            if (TL.tex == null || TL.solid) TC.tex = 'wall_BL';
        }
        if (TC.tex == 'wall_R') {
            TC.tex = 'wall_B';
            if (TR.tex == null || TR.solid) TC.tex = 'wall_BR';
        }
        if (BC.tex == 'wall_L') {
            BC.tex = 'wall_T';
            if (BL.tex == null || BL.solid) BC.tex = 'wall_TL';
        }
        if (BC.tex == 'wall_R') {
            BC.tex = 'wall_T';
            if (BR.tex == null || BR.solid) BC.tex = 'wall_TR';
        }

        if (CR.tex == 'wall_B') {
            CR.tex == 'wall_L';
            if (BR.tex == null || BR.solid) CR.tex = 'wall_BL';
        }
        if (CR.tex == 'wall_T') {
            CR.tex == 'wall_L';
            if (TR.tex == null || TR.solid) CR.tex = 'wall_TL';
        }
        if (CL.tex == 'wall_B') {
            CL.tex == 'wall_R';
            if (BL.tex == null || BL.solid) CL.tex = 'wall_BR';
        }
        if (CL.tex == 'wall_T') {
            CL.tex == 'wall_R';
            if (TL.tex == null || TL.solid) CL.tex = 'wall_TR';
        }

        if (['wall_T', 'wall_TL', 'wall_TR'].includes(TC.tex)) TC.tex = null;
        if (['wall_B', 'wall_BL', 'wall_BR'].includes(BC.tex)) BC.tex = null;
        if (['wall_L', 'wall_TL', 'wall_BL'].includes(CL.tex)) CL.tex = null;
        if (['wall_R', 'wall_TR', 'wall_BR'].includes(CR.tex)) CR.tex = null;

        if (['wall_BL'].includes(BL.tex)) BL.tex = null;
        if (['wall_BR'].includes(BR.tex)) BR.tex = null;
        if (['wall_TR'].includes(TR.tex)) TR.tex = null;
        if (['wall_TL'].includes(TL.tex)) TL.tex = null;

        if (BL.tex == 'wall_B') BL.tex = 'wall_BR';
        if (BR.tex == 'wall_B') BR.tex = 'wall_BL';

        if (TL.tex == 'wall_T') TL.tex = 'wall_TR';
        if (TR.tex == 'wall_T') TR.tex = 'wall_TL';

        if (TL.tex == 'wall_L') TL.tex = 'wall_BL';
        if (BL.tex == 'wall_L') BL.tex = 'wall_TL';

        if (TR.tex == 'wall_R') TR.tex = 'wall_BR';
        if (BR.tex == 'wall_R') BR.tex = 'wall_TR';

        if (TC.tex == 'wall_B' && [null, 'wall_BR', 'wall_TR'].includes(TL.tex)) TC.tex = 'wall_BL';
        if (TC.tex == 'wall_B' && [null, 'wall_BL', 'wall_TL'].includes(TR.tex)) TC.tex = 'wall_BR';
        if (BC.tex == 'wall_T' && [null, 'wall_BR', 'wall_TR'].includes(BL.tex)) BC.tex = 'wall_TL';
        if (BC.tex == 'wall_T' && [null, 'wall_BL', 'wall_TL'].includes(BR.tex)) BC.tex = 'wall_TR';

        if (CL.tex == 'wall_R' && [null, 'wall_BL', 'wall_BR'].includes(TL.tex)) CL.tex = 'wall_TR';
        if (CL.tex == 'wall_R' && [null, 'wall_TR', 'wall_TL'].includes(BL.tex)) CL.tex = 'wall_BR';
        if (CR.tex == 'wall_L' && [null, 'wall_BL', 'wall_BR'].includes(TR.tex)) CR.tex = 'wall_TL';
        if (CR.tex == 'wall_L' && [null, 'wall_TR', 'wall_TL'].includes(BR.tex)) CR.tex = 'wall_BL';

        if (TL.tex == 'wall_TR' && BL.tex == 'wall_BR') CL.tex == 'wall_R';
        if (TR.tex == 'wall_TL' && BR.tex == 'wall_BL') CR.tex == 'wall_L';

        if (TL.tex == 'wall_BL' && TR.tex == 'wall_BR') TC.tex == 'wall_B';
        if (BL.tex == 'wall_TL' && BR.tex == 'wall_TR') BC.tex == 'wall_T';

    },


    /**
     * Adds items to the editor menu
     */
    menuSetup: function () {
        $('body').append($('<div id="Editor">'));
        Editor.elem = document.getElementById("Editor");

        Editor.addEditorItem([{ block: "Terrain", block_id: "block_terrain" }]);
        Editor.addEditorItem([{ block_id: "block_terrain", type: "number", label: "Width", value: 20 }]);
        Editor.addEditorItem([{ block_id: "block_terrain", type: "number", label: "Height", value: 20 }]);
        Editor.addEditorItem([{ block_id: "block_terrain", type: "button", value: "Create New", onclick: "map.resetData()" }]);




        Editor.addEditorItem([{ block: "General", block_id: "block_general" }]);
        Editor.addEditorItem([{ block_id: "block_general", type: "checkbox", label: "Show grid", onchange: "Editor.showGrid = this.checked;", checked: Editor.showGrid }]);
        Editor.addEditorItem([{
            block_id: "block_general", type: "select", label: "Brush type", linkedList: true, list: [
                { text: "Smart Paint", link: 'block_paint' },
                { text: "Add Spawn", link: 'block_spawn' },
                { text: "Add Weapons", link: 'block_weapons' },
                { text: "Add Pickups", link: 'block_pickups' },
                { text: "Add Portals", link: 'block_portals' },
                { text: "Add Flag (CTF)", link: 'block_flags' }
            ]
        }]);
        Editor.addEditorItem([{ block: "Paint", block_id: "block_paint", linked: true }]);
        Editor.addEditorItem([{ block_id: "block_paint", type: "button", value: "Randomize floor", onclick: "Editor.randomFloor()" }]);
        Editor.addEditorItem([{ block_id: "block_paint", type: "button", value: "Randomize decals", onclick: "Editor.randomDecals()" }]);

        Editor.addEditorItem([{ block: "Weapons", block_id: "block_weapons", linked: true }]);
        Editor.addEditorItem([{
            block_id: "block_weapons", type: "select", label: "Weapon", list: [
                { text: "minigun" }, { text: "blastgun" }, { text: "shotgun" }, { text: "railgun" }, { text: "rpg" }
            ]
        }]);

        Editor.addEditorItem([{ block: "Pickups", block_id: "block_pickups", linked: true }]);
        Editor.addEditorItem([{
            block_id: "block_pickups", type: "select", label: "Pickup", list: [
                { text: "medkit" }, { text: "shield" }, { text: "speed" },
            ]
        }]);

        Editor.addEditorItem([{ block: "Portals", block_id: "block_portals", linked: true }]);
        Editor.addEditorItem([{
            block_id: "block_portals", type: "select", label: "Portal", list: [
                { text: "green" },
                { text: "blue" },
                { text: "orange" },
                { text: "turquoise" },
                { text: "yellow" },
                { text: "pink" },
                { text: "purple" },
                { text: "white" },
                { text: "red" },
            ]
        }]);

        Editor.addEditorItem([{ block: "Flags", block_id: "block_flags", linked: true }]);
        Editor.addEditorItem([{
            block_id: "block_flags", type: "select", label: "Flag team", list: [
                { text: "blue" }, { text: "green" }
            ]
        }]);

        Editor.addEditorItem([{ block: "Spawn", block_id: "block_spawn", linked: true }]);
        Editor.addEditorItem([{
            block_id: "block_spawn", type: "select", label: "Spawn team", list: [
                { text: "blue" }, { text: "green" }
            ]
        }]);

        /*
            Editor.addEditorItem([{ block: "Blood", block_id: "block_blood" }]);
            Editor.addEditorItem([
                { block_id: "block_blood", type: "button", value: "+", onclick: "Editor.addDecal('blood')" },
                { block_id: "block_blood", type: "button", value: "-", onclick: "Editor.removeDecal('blood')" }
            ]);
    
            Editor.addEditorItem([{ block: "Decals", block_id: "block_decals" }]);
            Editor.addEditorItem([
                { block_id: "block_decals", type: "button", value: "+", onclick: "Editor.addDecal('dirt')" },
                { block_id: "block_decals", type: "button", value: "-", onclick: "Editor.removeDecal('dirt')" }
            ]);
        */



        Editor.addEditorItem([{ block: "File", block_id: "block_file" }]);
        Editor.addEditorItem([
            { block_id: "block_file", type: "file", label: "Load", accept: ".json", onchangeEvent: function (e) { map.loadData(e) } },
            { block_id: "block_file", type: "button", value: "Save", onclick: "map.saveData(map.data, 'map.json')" }
        ]);


        $("label.menuItem").click(function () {
            if ($(this).hasClass("hiding")) {
                $(this).removeClass("hiding");
                $(this).parent().find("div").show();
            }
            else {
                $(this).addClass("hiding");
                $(this).parent().find("div").hide();
            }
        });

        this.updateMenu("editor_Brush_type_id");
    },


    /**
     * Creates the added items to the editor
     */
    addEditorItem: function (items) {
        var div = document.createElement("div");
        div.className = "menuItem";

        for (var i = 0; i < items.length; i++) {
            var item = items[i];

            if (item.block) {
                var lib = document.createElement("label");
                lib.className = "menuItem";
                lib.textContent = item.block;
                div.appendChild(lib);

                if ($("#" + item.block_id).length === 0) {
                    div.id = item.block_id;
                    Editor.elem.appendChild(div);
                }
                else
                    $("#" + item.block_id).append(div);

                if (item.linked) {
                    $(div).addClass("linked");
                    $(div).hide();
                }

                break;
            }

            if (item.label)
                item.id = "editor_" + item.label.split(' ').join('_') + "_id";

            var input;

            if (item.label) {
                var label = document.createElement("label");
                label.className = "itemLabel";
                label.textContent = item.label;
                label.setAttribute("for", item.id);
                if (item.type == "file") label.className += " file";
                div.appendChild(label);
            }



            if (item.type == "select") {
                input = document.createElement("select");

                for (var i = 0; i < item.list.length; i++) {
                    var opt = document.createElement("option");
                    var option = option = item.list[i].text;
                    opt.value = option;
                    opt.text = option;
                    opt.selected = (opt.value == item.value);
                    if (item.linkedList) {
                        var link = item.list[i].link;
                        opt.setAttribute("data-link", link);
                        input.setAttribute("onchange", "Editor.updateMenu('" + item.id + "');this.blur();");
                    }
                    else {
                        input.setAttribute("onchange", "this.blur();");
                    }
                    input.appendChild(opt);
                    input.id = item.id;
                }
            }
            else {
                input = document.createElement("input");
                if (item.id)
                    input.id = item.id;
                input.setAttribute("type", item.type);
                if (item.type != "checkbox")
                    input.setAttribute("value", item.value);
            }

            if (item.accept) {
                input.setAttribute("accept", item.accept);
            }

            if (item.onclick) {
                input.setAttribute("onclick", item.onclick);
            }

            if (item.onchange) {
                input.setAttribute("onchange", item.onchange);
            }

            if (item.onkeyup) {
                input.setAttribute("onkeyup", item.onkeyup);
            }

            if (item.onchangeEvent) {
                input.onchange = item.onchangeEvent;
            }

            if (item.checked) {
                input.defaultChecked = item.checked;
            }

            if (item.disabled) {
                input.disabled = item.disabled;
            }

            if (item.type == "text" || item.type == "number")
                input.setAttribute("onclick", "this.select()");


            div.appendChild(input);
            $("#" + item.block_id).append(div);
        }
    },

    /**
     * Event call when using linked buttons
     */
    updateMenu: function (id) {
        var link = $("#" + id).find(":selected").data("link");
        $(".linked").hide();
        $("#" + link).show();
    }

};
