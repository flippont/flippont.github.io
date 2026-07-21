let currentTab = "home";
let currentPage = "";
location.pathname.replace(/([^\/]*?)\/([^\/]*?)(\.html)?$/, (z,a,b,c) => { if(a) currentTab = a; if(b) currentPage = b; });
if(currentTab == "flippont.github.io" && (page == "" || page == "index")){
    currentTab = "home";
}

(function() {
    // palette from https://palettemaker.com/rainbow-colors
    var links = document.getElementsByTagName('a');
    var colours = ["#e81416", "#ffa500", "#faeb36", "#79c314", "#487de7", "#4b369d", "#70369d"];
    for (var a = 0; a < links.length; a++) {
        var randomColour = colours[Math.floor(colours.length * Math.random())];
        links[a].style.color = randomColour;
    }
    document.title = `Flippont / ${currentTab} / ${currentPage}`;
    document.querySelector("header").innerHTML = `
        <a href="${currentTab == "home" ? "./" : "../"}index.html" target=_self>${currentTab == "home" ? "" : "<" + currentTab}</a>
    `;
    if(currentTab != "home" && currentPage != "" && currentPage != "blog"){    
        s = document.createElement("SCRIPT");
        s.src = "https://utteranc.es/client.js";
        s.setAttribute("repo","flippont/flippont.github.io");
        s.setAttribute("issue-term","pathname");
        s.setAttribute("theme","github-light");
        s.setAttribute("crossorigin","anonymous");
        s.setAttribute("async","");
        if(document.querySelector(".container"))
        document.querySelector(".container").appendChild(s);
    }
})();  