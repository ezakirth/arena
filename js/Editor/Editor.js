var Editor = {
    active: true,
    elem: null,
    showGrid: true,
    clearItemsOnErase: false,
    paintRandomFloor: true,
    map: {},

    init: function () {
        this.map.init(20, 20);

        this.menuSetup();

        this.updateMenu("editor_Brush_type_id");
    },

    update: function () {
        if (Input.real.x > 276) {
            let ix = Math.floor(this.map.x);
            let fx = this.map.x - ix;
            let iy = Math.floor(this.map.y);
            let fy = this.map.y - iy;
            let x = Math.floor(Input.pos.x / this.map.tileSize + fx);
            let y = Math.floor(Input.pos.y / this.map.tileSize + fy);

            let px = (x + ix).clamp(0, this.map.w - 1);
            let py = (y + iy).clamp(0, this.map.h - 1);

            let selected = $("#editor_Brush_type_id").val();

            if (selected == "Smart Paint") {
                if (Input.mouse.left) this.paint(px, py);
                if (Input.mouse.right) this.clear(px, py);
            }
            else {
                if (Input.mouse.left) {
                    if (selected == "Add Spawn") this.addItem("spawn_" + $("#editor_Spawn_team_id").val(), px, py);
                    if (selected == "Add Weapons") this.addItem($("#editor_Weapon_id").val(), px, py);
                    if (selected == "Add Pickups") this.addItem($("#editor_Pickup_id").val(), px, py);
                    if (selected == "Add Portals") this.addItem($("#editor_Portal_id").val(), px, py);
                    if (selected == "Add Flag (CTF)") this.addItem("flag_" + $("#editor_Flag_team_id").val(), px, py);
                }
                if (Input.mouse.right) this.clearItem(px, py);
            }
        }

        //       this.overlay.update();
    },

    render: function () {
        Graphics.clear();

        Graphics.sprite("bg", Graphics.width / 2, Graphics.height / 2, Graphics.width, Graphics.height);

        this.map.render();

        Graphics.sprite("vignette", Graphics.width / 2, Graphics.height / 2, Graphics.width, Graphics.height);


    }



};
