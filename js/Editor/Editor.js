var Editor = {
    active: true,
    elem: null,
    showGrid: true,

    portalOrigin: null,

    init: function () {
        map.init(20, 20);

        Input.view = { x: map.w / 2, y: map.h / 2 };
        this.menuSetup();

    },

    /**
     * perform user interactions with the map
     */
    update: function () {
        if (Input.mouse.browser.x > 276) {
            let px = Input.mouse.mapX;
            let py = Input.mouse.mapY;

            if (!(map.data[px] !== undefined && map.data[px][py] !== undefined)) return;

            let selected = $("#editor_Brush_type_id").val();

            if (selected == "Smart Paint") {
                if (Input.mouse.left) this.paint(px, py);
                if (Input.mouse.right) this.clear(px, py);
            }
            else {
                if (Input.mouse.left) {
                    if (selected == "Add Spawn") this.addPickup("spawn_" + $("#editor_Spawn_team_id").val(), px, py);
                    if (selected == "Add Weapons") this.addPickup($("#editor_Weapon_id").val(), px, py);
                    if (selected == "Add Pickups") this.addPickup($("#editor_Pickup_id").val(), px, py);
                    if (selected == "Add Portals") this.addPortal($("#editor_Portal_id").val(), px, py);
                    if (selected == "Add Flag (CTF)") this.addPickup("flag_" + $("#editor_Flag_team_id").val(), px, py);
                }
                if (Input.mouse.right) {
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
        map.renderView(Input.view);
        gfx.sprite("vignette", gfx.width / 2, gfx.height / 2, gfx.width, gfx.height);
    }
};
