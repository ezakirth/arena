Editor.saveData = function (data, filename) {
    var json = JSON.stringify(data);
    localStorage.setItem('tileData', json);

    var blob = new Blob([json], { type: "octet/stream" });
    var url = window.URL.createObjectURL(blob);

    var a = document.createElement('a');
    document.body.append(a);
    a.href = url;
    a.download = filename;
    a.click();
    $(a).remove();
    window.URL.revokeObjectURL(url);
};

Editor.loadData = function (e) {
    if (e.target.files[0]) {
        var tmppath = URL.createObjectURL(e.target.files[0]);
        $.getJSON(tmppath, function (data) {
            Editor.map.load(data);
        });
    }
};
