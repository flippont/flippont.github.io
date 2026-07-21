let currentTab = "home";
let currentPage = "";
location.pathname.replace(/([^\/]*?)\/([^\/]*?)(\.html)?$/, (z,a,b,c) => { if(a) currentTab = a; if(b) currentPage = b; });
if(currentTab == "flippont.github.io" && (page == "" || page == "index")){
    currentTab = "home";
}

function moveIntoView(element) {
    document.getElementById(element).scrollIntoView();
}

(function() {
    document.title = `Flippont / ${currentTab} / ${currentPage}`;
    document.querySelector("header").innerHTML = `
        ${currentTab}<br>
        <a href="${currentTab == "home" ? "./" : "../"}index.html" target=_self>${currentTab == "home" ? "" : "<--"}</a>
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