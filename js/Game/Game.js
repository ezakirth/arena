var Game = {
    onlineMode: true,
    clients: {},
    localClientId: null,
    localClient: null,

    init: function () { },

    start: function () {
        if (this.onlineMode) {
            network.init();
        }
        else {
            this.localClientId = 'local';
            this.clients[this.localClientId] = new Client('-=BDN=- CHARpie', this.localClientId);
            this.localClient = this.clients[this.localClientId];
        }
    },

    getNbClients: function () {
        return this.clients.length;
    },

    update: function () {
        for (let clientId in this.clients) {
            this.clients[clientId].update();
        }
    },

    render: function () {
        gfx.clear();
        gfx.sprite("bg", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);

        if (this.localClient) this.localClient.render();



        gfx.sprite("vignette", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);
    }
};
