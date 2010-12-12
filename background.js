if (!widget.preferences.runOnceBefore) {
    widget.preferences.runOnceBefore = true;
    widget.preferences.popupWidth = "570";
    widget.preferences.popupHeight = "530";
    widget.preferences.privateAsDefault = false;
}

var o = opera.extension;
var uiitem;
var user, pass;

o.user = user;

var pinboard = new Pinboard(user, pass);

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
            //uiitem.disabled = !o.tabs.getFocused();
            break;
        default:
            break;
    }
}

/*
o.tabs.onfocus = function () {
    var tab = o.tabs.getFocused();
    opera.postError(tab ? tab.url : null);
    //uiitem.disabled = !o.tabs.getFocused();
    uiitem.disabled = !tab;
}
*/

function updateUIItem() {
    if (uiitem)
        opera.contexts.toolbar.removeItem(uiitem);

    uiitem = opera.contexts.toolbar.createItem({
        disabled: false,
        title: "pinboard.in",
        icon: "img/bluepin.gif",
        popup: {
            href: "popup.html",
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

