var Game = {
    startTime: new Date(),
    elapsedTime: 0,
    map: null,
    players: Array(),

    init: function ()
    {
        this.map.init();

        this.players.push(new Player(this.map.p1spawn.x * this.map.tileSize, this.map.p1spawn.y * this.map.tileSize));
        if (!solo)
            this.players.push(new Player(this.map.p2spawn.x * this.map.tileSize, this.map.p2spawn.y * this.map.tileSize));
    },

    getNbPlayers: function ()
    {
        return this.players.length;
    },

    update: function ()
    {
        this.elapsedTime = new Date() - this.startTime;

        for (let player of this.players)
        {
            if (player.id == 0) player.update();
        }
    },

    render: function ()
    {

        for (let player of this.players)
        {
            Graphics.setActiveCanvas(player.id);
            Graphics.clear();

            Graphics.sprite("bg", Graphics.width / 2, Graphics.height / 2, Graphics.width, Graphics.height);
            player.render();
            Graphics.sprite("vignette", Graphics.width / 2, Graphics.height / 2, Graphics.width, Graphics.height);
        }



    }
};
