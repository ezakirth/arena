var Editor = {
    active: true,
    elem: null,
    showGrid: true,

    portalOrigin: null,

    init: function () {
        map.init(20, 20);

        input.view = { x: map.w / 2, y: map.h / 2 };
        this.menuSetup();

    },

    /**
     * perform user interactions with the map
     */
    update: function () {
        if (input.mouse.browser.x > 276) {
            let px = input.mouse.mapX;
            let py = input.mouse.mapY;

            if (!(map.data[px] !== undefined && map.data[px][py] !== undefined)) return;

            let selected = $("#editor_Brush_type_id").val();

            if (selected == "Smart Paint") {
                if (input.mouse.left) this.paint(px, py);
                if (input.mouse.right) this.clear(px, py);
            }
            else {
                if (input.mouse.left) {
                    if (selected == "Add Spawn") this.addPickup("spawn_" + $("#editor_Spawn_team_id").val(), px, py);
                    if (selected == "Add Flag (CTF)") this.addPickup("flag_" + $("#editor_Flag_team_id").val(), px, py);
                    if (selected == "Add Weapons") this.addPickup($("#editor_Weapon_id").val(), px, py);
                    if (selected == "Add Pickups") this.addPickup($("#editor_Pickup_id").val(), px, py);
                    if (selected == "Add Portals") this.addPortal($("#editor_Portal_id").val(), px, py);
                }
                if (input.mouse.right) {
                    if (selected == "Add Portals")
                        this.clearPortal(px, py);
                    else
                        this.clearPickup(px, py);
                }
            }
        }

    },

    /**
     * Renders the map
     */
    render: function () {
        gfx.clear();

        gfx.sprite("bg", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);
        map.renderView(input.view);
        gfx.sprite("vignette", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);
    }
};
