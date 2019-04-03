/**
 * Fills the map floor with random floor tiles
 */
Editor.randomFloor = function () {
    for (var x = 0; x < map.w; x++) {
        for (var y = 0; y < map.h; y++) {
            var tile = map.data[x][y];
            if (tile.tex && tile.tex.startsWith('floor')) {
                if (tile.pickup) continue;
                this.randomFloorTile(tile);
            }
        }
    }
}

/**
 * Paints a random floor tile
 */
Editor.randomFloorTile = function (tile) {
    tile.tex = 'floor_1';
    if (Math.random() > 0.7) tile.tex = 'floor_' + Math.floor(Math.random() * 12 + 1);
}

Editor.clearTile = function (tile, tex) {
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
}

/**
 * Paints the map with floor and attempt to match surrounding tiles
 */
Editor.paint = function (px, py) {
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
}


/**
 * Clears the map at location and attemps to match surrounding tiles
 */
Editor.clear = function (px, py) {
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

}
