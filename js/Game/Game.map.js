"use strict";
Game.map = {

    init: function () {

        $.getJSON("map.json", function (data) {
            Game.map.data = data;
            Game.map.w = Game.map.data.length;
            Game.map.h = Game.map.data[0].length;

            for (let x = 0; x < Game.map.w; x++) {
                for (let y = 0; y < Game.map.h; y++) {
                    let block = Game.map.data[x][y];

                    if (block.pickup == "pickup_flag_blue") {
                        Game.map.p1flag = new Vector(x, y)
                    }
                    if (block.pickup == "pickup_flag_green") {
                        Game.map.p2flag = new Vector(x, y)
                    }
                    if (block.spawn == "spawn_blue") {
                        Game.map.p1spawn = new Vector(x + .5, y + .5)
                    }
                    if (block.spawn == "spawn_green") {
                        Game.map.p2spawn = new Vector(x + .5, y + .5)
                    }


                }
            };
            Game.start();
        });
        //  this.data = JSON.parse(localStorage.getItem('tileData'));

    }

}
