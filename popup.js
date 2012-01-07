
var bg = opera.extension.bgProcess;

function fillForm() {
    var url = bg.currentUrl(),
        title = bg.currentTitle(),
        f = document.forms["save-link"].elements,
        ret = { url: url, title: title };

    if (!url)
        return ret;

    setSaveFormHandlers(url);

    try {
        if (url in bg.storage) {
            var p = JSON.parse(bg.storage[url]);
            f.url.value = p.url;
            f.title.value = p.title;
            f.desc.value = p.description;
            f.tags.value = p.tags;
            f.private.checked = p.private;
            f.toread.checked = p.toread;
            f.replace.value = "true";
            ret.inStorage = true;
            return ret;
        }
    } catch (e) {}

    f.url.value = url;
    f.title.value = title;
    f.private.checked = widget.preferences.privateAsDefault == "true";

    return ret;
}

function setSaveFormHandlers(url) {
    var f = document.forms["save-link"].elements;

    var save = (function (url) { return function () { saveForm(url) }; })(url);
    var delayedSave = function () {
        var timerId;
        return function () {
            clearTimeout(timerId);
            timerId = setTimeout(save, 400);
        }
    }

    for (var i=0; i < f.length; i++) {
        if (f[i].type != "checkbox")
            f[i].onkeyup = delayedSave();
    }
}

function saveForm(url) {
    if (!url)
        return;

    var f = document.forms["save-link"];
    bg.storage[url] = JSON.stringify({
        url: f.elements.url.value,
        title: f.elements.title.value,
        description: f.elements.desc.value,
        tags: f.elements.tags.value,
        private: f.elements.private.checked,
        toread: f.elements.toread.checked,
    });
}

function populateFormFromExisting(r) {
    if (r.type == "posts" && r.posts.length == 1) {
        var f = document.forms["save-link"],
            p = r.posts[0];
        showMessage("message", "You already saved this page on " + r.date.toDateString() + ". The details will be updated.");
        f.elements.replace.value = "true";
        f.elements.title.value = p.title;
        f.elements.desc.value = p.description;
        f.elements.tags.value = p.tags.join(" ");
        f.elements.private.checked = !p.shared;
        f.elements.toread.checked = p.toread;
    }
}

function submitForm() {
    var e = document.forms["save-link"].elements,
        title = e.title.value,
        desc = e.desc.value,
        tags = e.tags.value.trim().split(" "),
        url = e.url.value,
        shared = !e.private.checked,
        toread = e.toread.checked || e.later.clicked,
        replace = e.replace.value == "true";

    e.later.clicked = false;

    showMessage("message", "Saving link", true);

    if (e.url.validity.valueMissing) {
        showMessage("error", "Fill out the url field");
        return true;
    }

    var cb = function (r) {
        if (r.error) {
            showMessage("error", 'Server returned error "'+r.code+"'");
        } else {
            showMessage("success", "Link saved!");
            delete bg.storage[url];
            setTimeout(function () { window.close(); }, 600);
        }
    }

    bg.pinboard.posts.add(cb, url, title, desc, tags, new Date(), replace, shared, toread);

    return false;
}

function addOrRemoveTag() {
    var tagsInput = document.forms["save-link"].elements.tags,
        tags = tagsInput.value ? tagsInput.value.split(" ") : [],
        tag = this.textContent,
        index = tags.indexOf(tag);

    if (index == -1)
        tags.push(tag);
    else {
        while (index != -1) {
            tags.splice(index, 1);
            index = tags.indexOf(tag);
        }
    }

    tagsInput.value = tags.join(" ");
    tagsInput.onkeyup();

    return false;
}

function setupUserTags(div, tagsInput) {
    var p = widget.preferences;

    if (p.tags) {
        var a = {
            type: "tags",
            tags: p.tags.split(" ").map(function (t) { return { name: t }; })
        }
        getPopulateTags(div, tagsInput)(a);
    }

    bg.pinboard.tags.get(getPopulateTags(div, tagsInput, true));
}

function getPopulateTags(div, tagsInput, cache) {
    return function (r) {
        var p = div.getElementsByTagName("p")[0];

        if (r.type == "tags") {
            new AutoComplete(tagsInput, r.tags.map(function (t) { return t.name; }));

            if (cache) {
                var s = r.tags.map(function (t) { return t.name }).join(" ");
                if (widget.preferences.tags == s)
                    return;
                widget.preferences.tags = s;
            }

            if (r.tags.length == 0) {
                p.innerHTML = "&#x2205;";
                return;
            }

            p.textContent = "";
            for (var i=0; i < r.tags.length; i++) {
                var a = document.createElement("a");
                a.href = "#";
                a.textContent = r.tags[i].name;
                a.onclick = addOrRemoveTag;
                p.appendChild(a);
                p.appendChild(document.createTextNode(" "));
            }
        } else {
            p.textContent = "Something went wrong while fetching the tags.";
        }
    }
}

function sendSelectionRequest() {
    var channel = new MessageChannel();

    channel.port1.onmessage = function (e) {
        var m = JSON.parse(e.data);
        if (m.type == "selection") {
            var desc = document.forms["save-link"].elements.desc;
            if (!desc.value)
                desc.value = m.selection;
        }
    }

    opera.extension.postMessage(JSON.stringify({ type: "selection" }), [channel.port2]);
}

