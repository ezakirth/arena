
module.exports = class Game {
    constructor() {
        this.clients = {};
        this.localClientId = null;
        this.localClient = null;

    }
    init() { }

    start() {
        network.init();
        //            this.localClientId = 'local';
        //          this.clients[this.localClientId] = new Client('-=BDN=- CHARpie', this.localClientId);
        //        this.localClient = this.clients[this.localClientId];
    }

    getNbClients() {
        return this.clients.length;
    }

    update() {
        for (let clientId in this.clients) {
            this.clients[clientId].update();
        }
    }

    render() {
        gfx.clear();
        gfx.sprite("bg", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);


        if (this.localClient) this.localClient.renderLocal();
        gfx.sprite("vignette", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);

    }
}
