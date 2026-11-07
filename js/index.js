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
    let firstColour = ["a", "0", Math.random() < 0.5 ? "a" : "0"]
        .sort(() => Math.random() - 0.5)
        .join("");
    let secondColour = firstColour.replaceAll("a", "b");
    document.querySelector(':root').style.setProperty('--first-colour', "#" + firstColour);
    document.querySelector(':root').style.setProperty('--second-colour', "#" + secondColour);
    
    document.getElementsByTagName("header")[0].innerHTML = 
    `   <h1 class="header"><i><a href="${generateString("index")}">Flippont</a></i></h1>
        <div class="nav">
            <a class="menu" href="${generateString("blog")}" style="background: #a00;">Blog</a>
            <a class="menu" href="${generateString("games")}" style="background: #0aa;">Games</a>
        </div>
    `;

    document.getElementsByTagName("footer")[0].innerHTML =
    `   <div class="footer">
            <p>© Flippont 2026</p>
        </div>
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