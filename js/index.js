let currentTab = "";
let currentPage = "";
location.pathname.replace(/([^\/]*?)\/([^\/]*?)(\.html)?$/, (z,a,b,c) => { if(a) currentTab = a; if(b) currentPage = b; });
if(currentPage == "" || currentPage == "index"){
    currentTab = "home";
}

function moveIntoView(element) {
    document.getElementById(element).scrollIntoView();
}

function generateString(tab) {
    let str = "";
    if (currentTab != "home") {
        if (currentTab == "blog" && currentPage != "blog") {
            str = "../" + tab + ".html";
        } else {
            str = "./" + tab + ".html";
        }
    } else {
        str = "./" + tab + ".html";
    }
    return str;
}

(function() {
    if ((currentTab == "blog" && currentPage != "blog")) {
        document.title = currentTab + ":" + currentPage;
    }
    document.getElementsByTagName("header")[0].innerHTML = 
    `   <h1 class="header"><i><a href="${generateString("index")}">Flippont Website</a></i></h1>
        <a class="menu" href="${generateString("blog")}">Blog</a>
        <a class="menu" href="${generateString("games")}">Games</a>
        `;

    if(currentTab == "blog" && currentPage != "blog"){    
        s = document.createElement("SCRIPT");
        s.src = "https://utteranc.es/client.js";
        s.setAttribute("repo","flippont/flippont.github.io");
        s.setAttribute("issue-term","pathname");
        s.setAttribute("theme","github-light");
        s.setAttribute("crossorigin","anonymous");
        s.setAttribute("async","");
        if(document.querySelector(".contents"))
        document.querySelector(".contents").appendChild(document.createElement("br"));
    document.querySelector(".contents").appendChild(document.createElement("h2")).innerText = "Comments";
        document.querySelector(".contents").appendChild(s);
    }
})();  