

/**
 * Fills floor
 */
Editor.randomFloor = function () {
    for (var x = 0; x < this.map.w; x++) {
        for (var y = 0; y < this.map.h; y++) {
            var tile = this.map.data[x][y];
            if (tile.tex && tile.tex.startsWith('floor')) {
                if (tile.pickup && tile.pickup.startsWith('pickup_flag')) continue;
                tile.tex = 'floor_1';
                if (Math.random() > .8) tile.tex = 'floor_' + Math.floor(Math.random() * 12 + 1);
            }
        }
    }
}





Editor.paint = function (px, py) {
    var tile = this.map.data[px][py];
    tile.solid = false;

    tile.tex = 'floor_1';
    if (this.paintRandomFloor) {
        if (Math.random() > .8) tile.tex = 'floor_' + Math.floor(Math.random() * 12 + 1);
    }

    var pTL = { x: (px - 1).clamp(0, this.map.w - 1), y: (py - 1).clamp(0, this.map.h - 1) };
    var pTC = { x: px, y: (py - 1).clamp(0, this.map.h - 1) };
    var pTC2 = { x: px, y: (py - 2).clamp(0, this.map.h - 1) };
    var pTR = { x: (px + 1).clamp(0, this.map.w - 1), y: (py - 1).clamp(0, this.map.h - 1) };

    var pCL = { x: (px - 1).clamp(0, this.map.w - 1), y: py };
    var pCL2 = { x: (px - 2).clamp(0, this.map.w - 1), y: py };
    var pCR = { x: (px + 1).clamp(0, this.map.w - 1), y: py };
    var pCR2 = { x: (px + 2).clamp(0, this.map.w - 1), y: py };

    var pBL = { x: (px - 1).clamp(0, this.map.w - 1), y: (py + 1).clamp(0, this.map.h - 1) };
    var pBC = { x: px, y: (py + 1).clamp(0, this.map.h - 1) };
    var pBC2 = { x: px, y: (py + 2).clamp(0, this.map.h - 1) };
    var pBR = { x: (px + 1).clamp(0, this.map.w - 1), y: (py + 1).clamp(0, this.map.h - 1) };

    var pBC2L = { x: (px - 1).clamp(0, this.map.w - 1), y: (py + 2).clamp(0, this.map.h - 1) };
    var pBC2R = { x: (px + 1).clamp(0, this.map.w - 1), y: (py + 2).clamp(0, this.map.h - 1) };
    var pTC2L = { x: (px - 1).clamp(0, this.map.w - 1), y: (py - 2).clamp(0, this.map.h - 1) };
    var pTC2R = { x: (px + 1).clamp(0, this.map.w - 1), y: (py - 2).clamp(0, this.map.h - 1) };

    var pCR2T = { x: (px + 2).clamp(0, this.map.w - 1), y: (py - 1).clamp(0, this.map.h - 1) };
    var pCR2B = { x: (px + 2).clamp(0, this.map.w - 1), y: (py + 1).clamp(0, this.map.h - 1) };
    var pCL2T = { x: (px - 2).clamp(0, this.map.w - 1), y: (py - 1).clamp(0, this.map.h - 1) };
    var pCL2B = { x: (px - 2).clamp(0, this.map.w - 1), y: (py + 1).clamp(0, this.map.h - 1) };

    var TL = this.map.data[pTL.x][pTL.y];
    var TC = this.map.data[pTC.x][pTC.y];
    var TC2 = this.map.data[pTC2.x][pTC2.y];
    var TR = this.map.data[pTR.x][pTR.y];

    var CL = this.map.data[pCL.x][pCL.y];
    var CL2 = this.map.data[pCL2.x][pCL2.y];
    var CR = this.map.data[pCR.x][pCR.y];
    var CR2 = this.map.data[pCR2.x][pCR2.y];

    var BL = this.map.data[pBL.x][pBL.y];
    var BC = this.map.data[pBC.x][pBC.y];
    var BC2 = this.map.data[pBC2.x][pBC2.y];
    var BR = this.map.data[pBR.x][pBR.y];

    var BC2L = this.map.data[pBC2L.x][pBC2L.y];
    var BC2R = this.map.data[pBC2R.x][pBC2R.y];
    var TC2L = this.map.data[pTC2L.x][pTC2L.y];
    var TC2R = this.map.data[pTC2R.x][pTC2R.y];
    var CR2T = this.map.data[pCR2T.x][pCR2T.y];
    var CR2B = this.map.data[pCR2B.x][pCR2B.y];
    var CL2T = this.map.data[pCL2T.x][pCL2T.y];
    var CL2B = this.map.data[pCL2B.x][pCL2B.y];

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



Editor.clear = function (px, py) {
    var pickupBackup = this.map.data[px][py].pickup;
    var tile = this.map.data[px][py] = new Tile();

    var pTL = { x: (px - 1).clamp(0, this.map.w - 1), y: (py - 1).clamp(0, this.map.h - 1) };
    var pTC = { x: px, y: (py - 1).clamp(0, this.map.h - 1) };
    var pTC2 = { x: px, y: (py - 2).clamp(0, this.map.h - 1) };
    var pTR = { x: (px + 1).clamp(0, this.map.w - 1), y: (py - 1).clamp(0, this.map.h - 1) };

    var pCL = { x: (px - 1).clamp(0, this.map.w - 1), y: py };
    var pCL2 = { x: (px - 2).clamp(0, this.map.w - 1), y: py };
    var pCR = { x: (px + 1).clamp(0, this.map.w - 1), y: py };
    var pCR2 = { x: (px + 2).clamp(0, this.map.w - 1), y: py };

    var pBL = { x: (px - 1).clamp(0, this.map.w - 1), y: (py + 1).clamp(0, this.map.h - 1) };
    var pBC = { x: px, y: (py + 1).clamp(0, this.map.h - 1) };
    var pBC2 = { x: px, y: (py + 2).clamp(0, this.map.h - 1) };
    var pBR = { x: (px + 1).clamp(0, this.map.w - 1), y: (py + 1).clamp(0, this.map.h - 1) };


    var TL = this.map.data[pTL.x][pTL.y];
    var TC = this.map.data[pTC.x][pTC.y];
    var TC2 = this.map.data[pTC2.x][pTC2.y];
    var TR = this.map.data[pTR.x][pTR.y];

    var CL = this.map.data[pCL.x][pCL.y];
    var CL2 = this.map.data[pCL2.x][pCL2.y];
    var CR = this.map.data[pCR.x][pCR.y];
    var CR2 = this.map.data[pCR2.x][pCR2.y];

    var BL = this.map.data[pBL.x][pBL.y];
    var BC = this.map.data[pBC.x][pBC.y];
    var BC2 = this.map.data[pBC2.x][pBC2.y];
    var BR = this.map.data[pBR.x][pBR.y];


    TL.solid = true;
    TC.solid = true;
    TR.solid = true;
    CL.solid = true;
    CR.solid = true;
    BL.solid = true;
    BC.solid = true;
    BR.solid = true;

    TL.shadow = null;
    TC.shadow = null;
    TR.shadow = null;
    CL.shadow = null;
    CR.shadow = null;
    BL.shadow = null;
    BC.shadow = null;
    BR.shadow = null;

    TL.decals = [];
    TC.decals = [];
    TR.decals = [];
    CL.decals = [];
    CR.decals = [];
    BL.decals = [];
    BC.decals = [];
    BR.decals = [];

    if (this.clearPickupsOnErase) {
        TL.pickup = null;
        TC.pickup = null;
        TR.pickup = null;
        CL.pickup = null;
        CR.pickup = null;
        BL.pickup = null;
        BC.pickup = null;
        BR.pickup = null;
    }
    else {
        tile.pickup = pickupBackup;
    }

    if (TL.tex) TL.tex = 'wall_BRC';
    if (TC.tex) TC.tex = 'wall_B';
    if (TR.tex) TR.tex = 'wall_BLC';
    if (CL.tex) CL.tex = 'wall_R';
    if (CR.tex) CR.tex = 'wall_L';
    if (BL.tex) BL.tex = 'wall_TRC';
    if (BC.tex) BC.tex = 'wall_T';
    if (BR.tex) BR.tex = 'wall_TLC';

    if (!BC2.tex && BC.tex) BC.tex = null;
    if (!TC2.tex && TC.tex) TC.tex = null;
    if (!CL2.tex && CL.tex) CL.tex = null;
    if (!CR2.tex && CR.tex) CR.tex = null;

    if (!CL.tex && TL.tex) TL.tex = 'wall_B';
    if (!CL.tex && BL.tex) BL.tex = 'wall_T';
    if (!CR.tex && TR.tex) TR.tex = 'wall_B';
    if (!CR.tex && BR.tex) BR.tex = 'wall_T';
    if (!BC.tex && BL.tex) BL.tex = 'wall_R';

    if (!BC.tex && BR.tex) BR.tex = 'wall_L';
    if (!TC.tex && TL.tex) TL.tex = 'wall_R';
    if (!TC.tex && TR.tex) TR.tex = 'wall_L';



    if (!BL.tex && CL.tex) CL.tex = 'wall_BR';
    if (!BR.tex && CR.tex) CR.tex = 'wall_BL';

    if (!TL.tex && TC.tex) TC.tex = 'wall_BL';
    if (!TR.tex && TC.tex) TC.tex = 'wall_BR';

    if (!BL.tex && BC.tex) BC.tex = 'wall_TL';
    if (!BR.tex && BC.tex) BC.tex = 'wall_TR';

    if (!TC.tex && !CR.tex && TR.tex) TR.tex = 'wall_BL';
    if (!TC.tex && !CL.tex && TL.tex) TL.tex = 'wall_BR';
    if (!CL.tex && !BC.tex && BL.tex) BL.tex = 'wall_TR';
    if (!CR.tex && !BC.tex && BR.tex) BR.tex = 'wall_TL';

    if (!TL.tex && CL.tex) CL.tex = 'wall_TR';
    if (!TR.tex && CR.tex) CR.tex = 'wall_TL';

    if (!BC2L.tex && !BC.tex && BL.tex) BL.tex = 'wall_BR';
    if (!BC2R.tex && !BC.tex && BR.tex) BR.tex = 'wall_BL';

    if (!BC2L.tex && !BC.tex && BL.tex) BL.tex = 'wall_BR';

    if (!TC2L.tex && !TC.tex && TL.tex) TL.tex = 'wall_TR';
    if (!TC2R.tex && !TC.tex && TR.tex) TR.tex = 'wall_TL';

    if (!CR2T.tex && !CR.tex && TR.tex) TR.tex = 'wall_BR';
    if (!CR2B.tex && !CR.tex && BR.tex) BR.tex = 'wall_TR';

    if (!CL2T.tex && !CL.tex && TL.tex) TL.tex = 'wall_BL';
    if (!CL2B.tex && !CL.tex && BL.tex) BL.tex = 'wall_TL';

}
