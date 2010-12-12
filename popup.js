
var $ = document.querySelector;
var bg = opera.extension.bgProcess;

function fillForm() {
    var url = bg.currentUrl(),
        title = bg.currentTitle(),
        form = document.forms["save-link"];

    form.elements.url.value = url;
    form.elements.title.value = title;
    form.elements.private.checked = widget.preferences.privateAsDefault == "true";
    //form.elements.desc.value = document.getSelection();

    return {
        url: url,
        title: title,
    }
}

function submitForm() {
    var e = document.forms["save-link"].elements,
        title = e.title.value,
        desc = e.desc.value,
        tags = e.tags.value.trim().split(" "),
        url = e.url.value,
        shared = !e.private.checked,
        toread = e.toread.checked || e.later.clicked;
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
            hideMessage();
        }
    }

    bg.pinboard.posts.add(cb, url, title, desc, tags, new Date(), false, shared, toread);

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

    return false;
}

function getPopulateTags(div) {
    return function (r) {
        var p = div.getElementsByTagName("p")[0];
        p.textContent = "";

        if (r.type == "tags") {
            if (r.tags.length == 0) {
                p.innerHTML = "&#x2205;";
                return;
            }

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

