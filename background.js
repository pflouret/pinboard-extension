if (!widget.preferences.runOnceBefore) {
    widget.preferences.runOnceBefore = true;
    widget.preferences.popupWidth = "570";
    widget.preferences.popupHeight = "530";
    widget.preferences.privateAsDefault = false;
}

var o = opera.extension;
var storage = localStorage;
var uiitem;
var user, pass;
var pinboard;

var alwaysEnableUIItem = true;

function setUser(username, password) {
    pinboard = new Pinboard(username, password);
    var r = pinboard.posts.update();

    if (r.type != "error") {
        user = username;
        pass = password;
        //uiitem.popup.href = "popup.html";
        //updateUIItem();
    }

    delete storage.userTags;

    return r;
}

function logout() {
    pinboard = null;
    user = null;
    pass = null;
    delete storage.userTags;
}

function currentTitle() {
    try { return o.tabs.getFocused().title; } catch (e) { return ""; }
}

function currentUrl() {
    try { return o.tabs.getFocused().url; } catch (e) { return ""; }
}

o.onmessage = function (e) {
    var obj = JSON.parse(e.data);
    switch (obj.type) {
        case "userjs":
            // it was probably a background page, not necessarily the focused one, but what the hell...
            if (!alwaysEnableUIItem && user)
                uiitem.disabled = !o.tabs.getFocused();
            break;
        default:
            break;
    }
}

if (!alwaysEnableUIItem) {
    o.tabs.onfocus = function () {
        if (user)
            uiitem.disabled = !o.tabs.getFocused();
    }
}

function updateUIItem() {
    if (uiitem)
        opera.contexts.toolbar.removeItem(uiitem);

    uiitem = opera.contexts.toolbar.createItem({
        disabled: false,
        title: "pinboard.in",
        icon: "img/bluepin.gif",
        popup: {
            href: "login.html",
            width: widget.preferences.popupWidth + "px",
            height: widget.preferences.popupHeight + "px"
        }
    });

    opera.contexts.toolbar.addItem(uiitem);

    return uiitem;
}

window.addEventListener("load", function() {
    updateUIItem();
}, false);

