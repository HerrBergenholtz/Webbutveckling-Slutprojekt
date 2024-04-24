let burger;
let localNav;
let body;

function init () {
    burger = document.getElementById("burgurMenu");
    localNav = document.querySelector("main section ul");
    main = document.getElementById("artist");
    burger.addEventListener("click", showLocalNav);
}
window.onload = init;
window.onresize = () => {
    if (window.innerWidth >= 1000) {
        localNav.style.display = "flex";
    } else {
        localNav.style.display = "none";
    }
}

function showLocalNav () {
    if (localNav.style.display == "none") {
        localNav.style.display = "flex";
    } else {
        localNav.style.display = "none";
    }
}
