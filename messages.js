
var animationId;

function showMessage(type, msg, dotAnimation) {
    var b = document.getElementById("msgbox");
    b.style.OTransitionDuration = "0s"; b.style.transitionDuration = "0s";
    b.style.OTransitionDelay= "0s"; b.style.transitionDelay= "0s";
    b.className = type;
    b.innerHTML = msg;

    if (animationId) {
        clearTimeout(animationId);
        animationId = null;
    }

    if (dotAnimation) {
        // hah!
        var s = document.createElement("span");
        s.textContent = "...";
        b.appendChild(s);
        animationId = setInterval(function () {
            setTimeout(function () { s.innerHTML = "&nbsp;&nbsp;&nbsp;"; }, 90);
            setTimeout(function () { s.innerHTML = ".&nbsp;&nbsp;"; }, 180);
            setTimeout(function () { s.innerHTML = "..&nbsp;"; }, 270);
            setTimeout(function () { s.innerHTML = "..."; }, 360);
        }, 900);
    }
}

function hideMessage(noDelay) {
    var b = document.getElementById("msgbox");
    if (!noDelay) {
        b.style.OTransitionDuration = "5s"; b.style.transitionDuration = "5s";
        b.style.OTransitionDelay= "3s"; b.style.transitionDelay= "3s";
    }

    b.className += " hidden";

    if (animationId) {
        clearTimeout(animationId);
        animationId = null;
    }
}

