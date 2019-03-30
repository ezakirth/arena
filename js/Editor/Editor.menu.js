Editor.menuSetup = function () {
    Editor.elem = document.getElementById("Editor");

    Editor.addEditorItem([{ block: "Terrain", block_id: "block_terrain" }]);
    Editor.addEditorItem([{ block_id: "block_terrain", type: "number", label: "Width", value: 10 }]);
    Editor.addEditorItem([{ block_id: "block_terrain", type: "number", label: "Height", value: 10 }]);
    Editor.addEditorItem([{ block_id: "block_terrain", type: "button", value: "Create New", onclick: "Editor.map.resetData()" }]);




    Editor.addEditorItem([{ block: "General", block_id: "block_general" }]);
    Editor.addEditorItem([{ block_id: "block_general", type: "checkbox", label: "Show grid", onchange: "Editor.showGrid = this.checked;", checked: Editor.showGrid }]);
    Editor.addEditorItem([{
        block_id: "block_general", type: "select", label: "Brush type", linkedList: true, list: [
            { text: "Smart Paint", link: 'block_paint' },
            { text: "Add Spawn", link: 'block_spawn' },
            { text: "Add Weapons", link: 'block_weapons' },
            { text: "Add Pickups", link: 'block_pickups' },
            { text: "Add Portals", link: 'block_portals' },
            { text: "Add Flag (CTF)", link: 'block_flags' }
        ]
    }]);
    Editor.addEditorItem([{ block: "Paint", block_id: "block_paint", linked: true }]);
    Editor.addEditorItem([{ block_id: "block_paint", type: "checkbox", label: "Clear items on erase", onchange: "Editor.clearItemsOnErase = this.checked;", checked: Editor.clearItemsOnErase }]);
    Editor.addEditorItem([{ block_id: "block_paint", type: "checkbox", label: "Paint random floor", onchange: "Editor.paintRandomFloor = this.checked;", checked: Editor.paintRandomFloor }]);
    Editor.addEditorItem([{ block_id: "block_paint", type: "button", value: "Randomize floor", onclick: "Editor.randomFloor()" }]);

    Editor.addEditorItem([{ block: "Weapons", block_id: "block_weapons", linked: true }]);
    Editor.addEditorItem([{
        block_id: "block_weapons", type: "select", label: "Weapon", list: [
            { text: "minigun" }, { text: "blastgun" }, { text: "shotgun" }, { text: "railgun" }, { text: "rpg" }
        ]
    }]);

    Editor.addEditorItem([{ block: "Pickups", block_id: "block_pickups", linked: true }]);
    Editor.addEditorItem([{
        block_id: "block_pickups", type: "select", label: "Pickup", list: [
            { text: "medkit" }, { text: "shield" }, { text: "speed" },
        ]
    }]);

    Editor.addEditorItem([{ block: "Portals", block_id: "block_portals", linked: true }]);
    Editor.addEditorItem([{
        block_id: "block_portals", type: "select", label: "Portal", list: [
            { text: "Red" }, { text: "Blue" }, { text: "Green" }, { text: "Tellow" }
        ]
    }]);

    Editor.addEditorItem([{ block: "Flags", block_id: "block_flags", linked: true }]);
    Editor.addEditorItem([{
        block_id: "block_flags", type: "select", label: "Flag team", list: [
            { text: "blue" }, { text: "green" }
        ]
    }]);

    Editor.addEditorItem([{ block: "Spawn", block_id: "block_spawn", linked: true }]);
    Editor.addEditorItem([{
        block_id: "block_spawn", type: "select", label: "Spawn team", list: [
            { text: "blue" }, { text: "green" }
        ]
    }]);


    Editor.addEditorItem([{ block: "Blood", block_id: "block_blood" }]);
    Editor.addEditorItem([
        { block_id: "block_blood", type: "button", value: "+", onclick: "Editor.addDecal('blood')" },
        { block_id: "block_blood", type: "button", value: "-", onclick: "Editor.removeDecal('blood')" }
    ]);

    Editor.addEditorItem([{ block: "Decals", block_id: "block_decals" }]);
    Editor.addEditorItem([
        { block_id: "block_decals", type: "button", value: "+", onclick: "Editor.addDecal('dirt')" },
        { block_id: "block_decals", type: "button", value: "-", onclick: "Editor.removeDecal('dirt')" }
    ]);




    Editor.addEditorItem([{ block: "File", block_id: "block_file" }]);
    Editor.addEditorItem([
        { block_id: "block_file", type: "file", label: "Load", accept: ".json", onchangeEvent: Editor.loadData },
        { block_id: "block_file", type: "button", value: "Save", onclick: "Editor.saveData(Editor.map.data, 'map.json')" }
    ]);


    $("label.menuItem").click(function () {
        if ($(this).hasClass("hiding")) {
            $(this).removeClass("hiding");
            $(this).parent().find("div").show();
        }
        else {
            $(this).addClass("hiding");
            $(this).parent().find("div").hide();
        }
    });
}


Editor.addEditorItem = function (items) {
    var div = document.createElement("div");
    div.className = "menuItem";

    for (var i = 0; i < items.length; i++) {
        var item = items[i];

        if (item.block) {
            var lib = document.createElement("label");
            lib.className = "menuItem";
            lib.textContent = item.block;
            div.appendChild(lib);

            if ($("#" + item.block_id).length === 0) {
                div.id = item.block_id;
                Editor.elem.appendChild(div);
            }
            else
                $("#" + item.block_id).append(div);

            if (item.linked) {
                $(div).addClass("linked");
                $(div).hide();
            }

            break;
        }

        if (item.label)
            item.id = "editor_" + item.label.split(' ').join('_') + "_id";

        var input;

        if (item.label) {
            var label = document.createElement("label");
            label.className = "itemLabel";
            label.textContent = item.label;
            label.setAttribute("for", item.id);
            if (item.type == "file") label.className += " file";
            div.appendChild(label);
        }



        if (item.type == "select") {
            input = document.createElement("select");

            for (var i = 0; i < item.list.length; i++) {
                var opt = document.createElement("option");
                var option = option = item.list[i].text;
                opt.value = option;
                opt.text = option;
                opt.selected = (opt.value == item.value);
                if (item.linkedList) {
                    var link = item.list[i].link;
                    opt.setAttribute("data-link", link);
                    input.setAttribute("onchange", "Editor.updateMenu('" + item.id + "');this.blur();");
                }
                else {
                    input.setAttribute("onchange", "this.blur();");
                }
                input.appendChild(opt);
                input.id = item.id;
            }
        }
        else {
            input = document.createElement("input");
            if (item.id)
                input.id = item.id;
            input.setAttribute("type", item.type);
            if (item.type != "checkbox")
                input.setAttribute("value", item.value);
        }

        if (item.accept) {
            input.setAttribute("accept", item.accept);
        }

        if (item.onclick) {
            input.setAttribute("onclick", item.onclick);
        }

        if (item.onchange) {
            input.setAttribute("onchange", item.onchange);
        }

        if (item.onkeyup) {
            input.setAttribute("onkeyup", item.onkeyup);
        }

        if (item.onchangeEvent) {
            input.onchange = item.onchangeEvent;
        }

        if (item.checked) {
            input.defaultChecked = item.checked;
        }

        if (item.disabled) {
            input.disabled = item.disabled;
        }

        if (item.type == "text" || item.type == "number")
            input.setAttribute("onclick", "this.select()");


        div.appendChild(input);
        $("#" + item.block_id).append(div);
    }
};


Editor.updateMenu = function (id) {
    var link = $("#" + id).find(":selected").data("link");
    $(".linked").hide();
    $("#" + link).show();
}
