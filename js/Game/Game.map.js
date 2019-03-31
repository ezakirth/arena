"use strict";
Game.map = {

    init: function () {
        this.data = JSON.parse(localStorage.getItem('tileData'));

        this.w = this.data.length;
        this.h = this.data[0].length;


        for (let x = 0; x < this.w; x++) {
            for (let y = 0; y < this.h; y++) {
                let block = this.data[x][y];

                if (block.pickup == "pickup_flag_blue") {
                    this.p1flag = new Vector(x, y)
                }
                if (block.pickup == "pickup_flag_green") {
                    this.p2flag = new Vector(x, y)
                }
                if (block.spawn == "spawn_blue") {
                    this.p1spawn = new Vector(x + .5, y + .5)
                }
                if (block.spawn == "spawn_green") {
                    this.p2spawn = new Vector(x + .5, y + .5)
                }


            }
        };
    }

}
