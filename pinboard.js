function Pinboard(user, pass) {
    var ENDPOINT_URL = "https://api.pinboard.in/v1/";

    this.posts = {
        update: function (cb) {
            return request("posts/update", null, cb);
        },

        add: function (cb, url, title, description, tags, date, replace, shared, toread) {
            var args = {
                url: url,
                description: title,
                extended: description,
                tags: tags,
                dt: date ? date.toISOString() : "",
                replace: replace ? "yes" : "no",
                shared: typeof(shared) == "undefined" || shared ? "yes" : "no",
                toread: toread ? "yes" : "no"
            }
            return request("posts/add", args, cb);
        },

        del: function (cb, url) {
            var args = { url: url };
            return request("posts/delete", args, cb);
        },

        get: function (cb, tags, date, url, hashes, meta) {
            var args = {
                tag: tags,
                dt: (date || new Date()).toISOString(),
                url: url,
                hashes: hashes,
                meta: meta ? "yes" : "no"
            }
            return request("posts/get", args, cb);
        },

        recent: function (cb, tag, count) {
            var args = { tag: tag, count: count };
            return request("posts/recent", args, cb);
        },

        dates: function (cb, tag) {
            var args = { tag: tag };
            return request("posts/dates", args, cb);
        },

        all: function (cb, tag, start, count, fromDate, toDate, meta) {
            var args = {
                tag: tag,
                start: start,
                count: count,
                fromdt: fromDate ? fromDate.toISOString() : "",
                todt: toDate ? toDate.toISOString() : "",
                meta: meta ? "yes" : "no"
            };
            return request("posts/all", args, cb);
        },

        suggest: function (cb, url) {
            var args = { url: url };
            return request("posts/suggest", args, cb);
        }
    }

    this.tags = {
        get: function (cb) {
            return request("tags/get", null, cb);
        },

        del: function (cb, tag) {
            var args = { tag: tag };
            return request("tags/delete", args, cb);
        },

        rename: function (cb, oldTag, newTag) {
            var args = { oldTag: oldTag, newTag: newTag };
            return request("tags/rename", args, cb);
        }
    }

    function getUrl(method, args) {
        var url = ENDPOINT_URL + method;

        var q = [];
        for (k in args) {
            var v = args[k];
            if (v instanceof Array)
                v = v.join(" ");

            if (v)
                q.push(k + "=" + escape(v));
        }

        return q.length == 0 ? url : url + "?" + q.join("&");
    }

    function getError(msg, httpStatus) {
        return { type: "error", msg: msg, code: httpStatus }
    }

    function getResult(xhr, method) {
        if (xhr.status != 200 && xhr.status != 0)
            return getError("Server returned status code " + xhr.status);

        var xml = xhr.responseXML;
        try {
            switch (method) {
                case "posts/update":
                    return {
                        type: "time",
                        time: new Date(Date.parse(xml.querySelector("update").getAttribute("time")))
                    }

                case "posts/add":
                case "posts/delete":
                    var code = xml.querySelector("result").getAttribute("code");
                    return { type: "result_code", error: code != "done", code: code }

                case "posts/recent":
                case "posts/get":
                case "posts/all":
                    var postsElem = xml.querySelector("posts");
                    var posts = xml.querySelectorAll("post");
                    var r = {
                        type: "posts",
                        date: new Date(Date.parse(postsElem.getAttribute("dt"))),
                        tag: postsElem.getAttribute("tag"),
                        posts: []
                    }
                    for (var i=0; i < posts.length; i++) {
                        var p = posts[i],
                            tags = p.getAttribute("tag");
                        r.posts.push({
                            url: p.getAttribute("href"),
                            date: new Date(Date.parse(p.getAttribute("time"))),
                            title: p.getAttribute("description"),
                            description: p.getAttribute("extended"),
                            tags: p ? p.split(" ") : [],
                            shared: p.getAttribute("shared") == "no" ? false : true,
                            toread: p.getAttribute("toread") == "yes" ? true : false,
                            hash: p.getAttribute("hash"),
                            meta: p.getAttribute("meta")
                        });
                    }
                    return r;

                case "posts/dates":
                    var datesElem = xml.querySelector("dates");
                    var dates= datesElem.querySelectorAll("date");
                    var r = {
                        type: "dates",
                        tag: postsElem.getAttribute("tag"),
                        dates: []
                    }
                    for (var i=0; i < dates.length; i++) {
                        r.dates.push({
                            date: new Date(Date.parse(dates[i].getAttribute("date"))),
                            count: parseInt(dates[i].getAttribute("count")),
                        });
                    }
                    return r;

                case "posts/suggest":
                    var suggested = xml.querySelector("suggested");
                    var r = { type: "tags", tags: [] }
                    for (var i=0; i < suggested.childNodes.length; i++) {
                        if (suggested.childNodes[i] instanceof Element)
                            r.tags.push({
                                name: suggested.childNodes[i].textContent,
                                count: 0
                            });
                    }
                    return r;

                case "tags/get":
                    var tags = xml.querySelectorAll("tag");
                    var r = { type: "tags", tags: [] }
                    for (var i=0; i < tags.length; i++) {
                        r.tags.push({
                            name: tags[i].getAttribute("tag"),
                            count: parseInt(tags[i].getAttribute("count"))
                        });
                    }
                    return r;

                case "tags/delete":
                case "tags/rename":
                    var code = xml.querySelector("result").textContent;
                    return { type: "result_code", error: code != "done", code: code }
            }
        } catch (e) {}

        return getError("Something went wrong");
    }

    function request(method, args, cb) {
        var async = !!cb;
        var xhr = new XMLHttpRequest();
        xhr.open("get", getUrl(method, args), async, user, pass);

        if (async) {
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    cb(getResult(xhr, method));
                }
            }
        }

        xhr.send(null);

        if (!async)
            return getResult(xhr, method);
    }
}

