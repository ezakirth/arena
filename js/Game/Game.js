var Game = {
    players: Array(),


    init: function () {
        map.setupGame();
    },

    start: function () {
        this.players.push(new Player('-=BDN=- CHARpie'));

        if (nbPlayers == 2)
            this.players.push(new Player('-=BDN=- Toto'));
    },

    getNbPlayers: function () {
        return this.players.length;
    },

    update: function () {
        if (map.data) {

            for (let player of this.players) {
                if (player.id == 0) player.update();
            }
        }
    },

    render: function () {
        if (map.data) {

            for (let player of this.players) {
                gfx.setActiveCanvas(player.id);
                gfx.clear();

                gfx.sprite("bg", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);
                player.render();
                gfx.sprite("vignette", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);
            }
        }


    }
};
