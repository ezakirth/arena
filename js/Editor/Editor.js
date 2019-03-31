var Editor = {
    active: true,
    elem: null,
    showGrid: true,
    clearPickupsOnErase: false,
    paintRandomFloor: true,
    map: {},

    init: function () {
        this.map.init(20, 20);

        this.menuSetup();

        this.updateMenu("editor_Brush_type_id");
    },

    update: function () {
        if (Input.mouse.browser.x > 276) {

            let px = Input.mapX;
            let py = Input.mapY;
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
                    if (selected == "Add Portals") this.addPickup($("#editor_Portal_id").val(), px, py);
                    if (selected == "Add Flag (CTF)") this.addPickup("flag_" + $("#editor_Flag_team_id").val(), px, py);
                }
                if (Input.mouse.right) this.clearPickup(px, py);
            }
        }

    },

    render: function () {
        gfx.clear();

        gfx.sprite("bg", 0, 0, gfx.width, gfx.height);

        this.map.render();

        gfx.sprite("vignette", 0, 0, gfx.width, gfx.height);


    }



};
