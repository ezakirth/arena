var Game = {
    startTime: new Date(),
    elapsedTime: 0,
    map: null,
    players: Array(),

    init: function () {
        this.map.init();

        this.players.push(new Player(this.map.p1spawn.x, this.map.p1spawn.y));
        if (!solo)
            this.players.push(new Player(this.map.p2spawn.x, this.map.p2spawn.y));
    },

    getNbPlayers: function () {
        return this.players.length;
    },

    update: function () {
        this.elapsedTime = new Date() - this.startTime;

        for (let player of this.players) {
            if (player.id == 0) player.update();
        }
    },

    render: function () {

        for (let player of this.players) {
            gfx.setActiveCanvas(player.id);
            gfx.clear();

            gfx.sprite("bg", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);
            player.render();
            gfx.sprite("vignette", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);
        }



    }
};
