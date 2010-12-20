
var o = opera.extension;
var storage = localStorage;
var uiitem;
var user, pass;
var pinboard;

function setUser(username, password, save) {
    pinboard = new Pinboard(username, password);
    var r = pinboard.posts.update();

    if (r.type != "error") {
        user = username;
        pass = password;

        if (save) {
            widget.preferences.u = user;
            widget.preferences.p = pass;
        }
    }

    delete widget.preferences.tags;
    storage.clear();

    return r;
}

function logout() {
    pinboard = null;
    user = null;
    pass = null;
    delete widget.preferences.u;
    delete widget.preferences.p;
    delete widget.preferences.tags;
    storage.clear();
}

function currentTitle() {
    try { return o.tabs.getFocused().title; } catch (e) { return ""; }
}

function currentUrl() {
    try { return o.tabs.getFocused().url; } catch (e) { return ""; }
}

o.onmessage = function (e) {
    var m = JSON.parse(e.data);
    switch (m.type) {
        case "selection":
            try {
                o.tabs.getFocused().postMessage(e.data, e.ports);
            } catch (e) {}
        default:
            break;
    }
}

function updateUIItem() {
    if (uiitem)
        opera.contexts.toolbar.removeItem(uiitem);

    uiitem = opera.contexts.toolbar.createItem({
        title: "pinboard.in",
        icon: "img/logo18.png",
        popup: {
            href: "login.html",
            width: widget.preferences.popupWidth + "px",
            height: widget.preferences.popupHeight + "px"
        }
    });

    opera.contexts.toolbar.addItem(uiitem);

    return uiitem;
}

updateUIItem();

if (widget.preferences.u && widget.preferences.p)
    setUser(widget.preferences.u, widget.preferences.p);

