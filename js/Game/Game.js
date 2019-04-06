
module.exports = class Game {
    constructor() {
        this.clients = {};
        this.localClientId = null;
        this.localClient = null;

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
