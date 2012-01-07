
function AutoComplete(elem, completions, separator) {
    var that = this;
    this.elem = elem;
    this.completions = completions;
    this.matches = [];
    this.highlighted = -1;
    this.showingList = false;
    this.div = document.createElement("div");
    this.originalHeight;

    this.div.id = "autocomplete";
    this.div.style.display = "none";
    document.body.appendChild(this.div);

    var TAB = 9, ENTER = 13, SHIFT = 16, ESC = 27, KEYUP = 38, KEYDN = 40;
    separator = separator || " ";
    var separatorKeyCode = separator ? separator.charCodeAt(0) : " ".char;

    elem.setAttribute("autocomplete", "off");

    document.addEventListener("click", function () {
        that.hideList();
    }, false);

    elem.addEventListener("keypress", function (e) {
        switch(e.keyCode) {
        case TAB:
            if (that.showingList) {
                if (e.shiftKey) {
                    that.highlighted -= 1;
                    if (that.highlighted < 0)
                        that.highlighted = that.matches.length - 1;
                } else
                    that.highlighted = (that.highlighted + 1) % that.matches.length;

                that.changeHighlight();
                e.preventDefault();
            }
            break;

        case KEYUP:
            if (that.highlighted > 0)
                that.highlighted--;
            that.changeHighlight();
            break;

        case KEYDN:
            if (that.highlighted < (that.matches.length - 1))
                that.highlighted++;
            that.changeHighlight();
            break;

        case ESC:
        case separatorKeyCode:
            that.hideList();
            break;

        case ENTER:
            if (that.showingList) {
                that.complete();
                e.preventDefault();
            }
            break;
        }
    }, false);

    elem.addEventListener("keyup", function(e) {
        switch(e.keyCode) {
        case TAB:
        case ENTER:
        case SHIFT:
        case ESC:
        case KEYUP:
        case KEYDN:
        case separatorKeyCode:
            return;

        default:
            that.findMatches();
            that.showList();
        }
    }, false);

    this.findMatches = function() {
        var start = this.elem.value.lastIndexOf(" ", this.elem.selectionStart-1) + 1;
        var end = this.elem.selectionStart;

        var word = this.elem.value.substring(start, end);

        this.matches = [];
        for (i in this.completions) {
            var c = this.completions[i];
            
            if(c.toLowerCase().indexOf(word.toLowerCase()) == 0)
                this.matches.push(c);
        }
    };

    this.complete = function() {
        var match = this.matches[this.highlighted];
        var value = this.elem.value;

        var start = value.lastIndexOf(" ", this.elem.selectionStart-1) + 1;
        var end = this.elem.selectionStart;
        
        this.elem.value = value.substring(0, start) + match + separator + value.substr(end);
        this.elem.selectionStart = start + match.length + 1;
        this.elem.selectionEnd = this.elem.selectionStart;

        this.hideList();
    };

    this.showList = function() {
        this.showingList = true;
        this.highlighted = 0;
        this.createDiv();
        this.positionDiv();
        this.div.style.display = 'block';
    };

    this.hideList = function() {
        if (!this.showingList)
            return;
        this.div.style.display = 'none';
        this.div.innerHTML = '';
        this.highlighted = -1;
        this.showingList = false;
    };

    this.changeHighlight = function() {
        var div = this.div;
        div.querySelector("li.selected").className = "";
        var li = div.getElementsByTagName('li')[this.highlighted]
        li.className = "selected";
        li.scrollIntoView(false);
    };

    this.createDiv = function() {
        var ul = document.createElement('ul');
    
        for (i in this.matches) {
            var word = this.matches[i];
    
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.href = "javascript:void()";
            a.innerHTML = word;
            li.appendChild(a);
    
            if (that.highlighted == i)
                li.className = "selected";
    
            ul.appendChild(li);
        }
    
        this.div.innerHTML = "";
        this.div.appendChild(ul);

        ul.onmouseover = function(e) {
            var target = e.target;
            while (target.parentNode && target.tagName.toLowerCase() != 'li')
                target = target.parentNode;
        
            var lis = that.div.getElementsByTagName('li');
    
            for (i in lis) {
                if(lis[i] == target) {
                    that.highlighted = i;
                    break;
                }
            }

            that.changeHighlight();
        };

        ul.onclick = function(e) {
            that.complete();
            that.hideList();
            that.elem.focus();
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
    
        this.div.className = "completion_list";
        this.div.style.position = 'absolute';

    };

    this.positionDiv = function() {
        var elem = this.elem;
        var x = 0;
        var y = elem.offsetHeight;
    
        while (elem.offsetParent && elem.tagName.toLowerCase() != 'body') {
            x += elem.offsetLeft;
            y += elem.offsetTop;
            elem = elem.offsetParent;
        }

        x += elem.offsetLeft;
        y += elem.offsetTop;

        this.div.style.left = x + 'px';
        this.div.style.top = y + 'px';
    };

}

