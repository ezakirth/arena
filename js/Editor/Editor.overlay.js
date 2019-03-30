Editor.overlay = {
    ctx: null,
    init: function () {
        Editor.overlay.ctx = document.getElementById("overlay").getContext("2d");
        var ctx = Editor.overlay.ctx;
        ctx.canvas.width = Editor.width;
        ctx.canvas.height = Editor.height;

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;

        ctx.font = "120px Arial";
        ctx.lineCap = "round";
    },

    touch: function (x, y) {
        y = Editor.height - y;
        Editor.resizing = false;
        var sprite = Editor.selected;
        if (sprite) {
            if (sprite.type == "terrain") return;
            sprite.updateOverlayPos();

            if (
                (x > sprite.screenX - 55 && x < sprite.screenX + 20) && (y > sprite.screenY - 55 && y < sprite.screenY + 40) || // TL
                (x > sprite.screenX + sprite.w - 25 && x < sprite.screenX + sprite.w + 50) && (y > sprite.screenY - 55 && y < sprite.screenY + 40) || // TR
                (x > sprite.screenX - 55 && x < sprite.screenX + 20) && (y > sprite.screenY + sprite.h - 40 && y < sprite.screenY + sprite.h + 60) || // BL
                (x > sprite.screenX + sprite.w - 25 && x < sprite.screenX + sprite.w + 50) && (y > sprite.screenY + sprite.h - 40 && y < sprite.screenY + sprite.h + 60) // BR
            )
                Editor.resizing = true;
        }
    },

    update: function () {
        var ctx = Editor.overlay.ctx;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (Editor.editMode && Editor.selected) {

            var sprite = Editor.selected;
            sprite.updateOverlayPos();

            ctx.beginPath();
            ctx.setLineDash([30, 30]);
            if (Editor.foundLocked == Editor.selected)
                ctx.strokeStyle = "#666666";
            else
                ctx.strokeStyle = "#FFFFFF";

            ctx.moveTo(sprite.screenX, sprite.screenY);
            ctx.lineTo(sprite.screenX + sprite.w, sprite.screenY);
            ctx.lineTo(sprite.screenX + sprite.w, sprite.screenY + sprite.h);
            ctx.lineTo(sprite.screenX, sprite.screenY + sprite.h);
            ctx.lineTo(sprite.screenX, sprite.screenY);
            //  ctx.rect(sprite.screenX, sprite.screenY, sprite.w, sprite.h);
            ctx.stroke();
            ctx.setLineDash([]);

            if (sprite.type == "terrain") return;

            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2;

            if (Editor.foundLocked == Editor.selected)
                ctx.fillStyle = "#666666";
            else
                ctx.fillStyle = "#FFFFFF";

            ctx.fillText("╔", sprite.screenX - 75, sprite.screenY);
            ctx.fillText("╗", sprite.screenX - 12 + sprite.w, sprite.screenY);
            ctx.fillText("╚", sprite.screenX - 75, sprite.screenY + sprite.h + 75);
            ctx.fillText("╝", sprite.screenX - 12 + sprite.w, sprite.screenY + sprite.h + 75);
            ctx.strokeText("╔", sprite.screenX - 75, sprite.screenY);
            ctx.strokeText("╗", sprite.screenX - 12 + sprite.w, sprite.screenY);
            ctx.strokeText("╚", sprite.screenX - 75, sprite.screenY + sprite.h + 75);
            ctx.strokeText("╝", sprite.screenX - 12 + sprite.w, sprite.screenY + sprite.h + 75);
        }
    }
};
