module.exports = class HUD {
    constructor() {
        let menuButton = {
            x: gfx.width - 64,
            y: 64,
            size: tileSize,
            off: 'hud_button_menu_off',
            on: 'hud_button_menu_on'
        }

        this.buttons = [];
        this.buttons.push(menuButton);
    }

    render() {
        for (let button of this.buttons) {
            gfx.sprite(button[this.hover(button)], button.x, button.y, button.size, button.size);
        }
    }

    hover(button) {
        if (input.mouse.x > button.x - button.size / 2 &&
            input.mouse.x < button.x + button.size / 2 &&
            input.mouse.y > button.y - button.size / 2 &&
            input.mouse.y < button.y + button.size / 2)
            return 'on';
        else
            return 'off';
    }
    active() {

    }

}