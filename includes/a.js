opera.extension.postMessage(JSON.stringify({type: "userjs"}));

opera.extension.onmessage = function (e) {
    var m = JSON.parse(e.data);
    if (m.type == "selection" && document.getSelection()) {
        e.ports[0].postMessage(JSON.stringify({
            type: "selection",
            selection: document.getSelection()
        }));
    }
}
