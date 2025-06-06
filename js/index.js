let currentTab = "home";
var currentPage = "";
location.pathname.replace(/([^\/]*?)\/([^\/]*?)(\.html)?$/, (z,a,b,c) => { if(a) currentTab = a; if(b) currentPage = b; });
if(currentTab == "flippont.github.io" && (page == "" || page == "index")){
    currentTab = "home";
}

function header() {
    document.title = `Flippont / ${currentTab} / ${currentPage}`;

    document.querySelector("header").innerHTML = `
        <img src="${currentTab == "home" ? "./" : "../"}images/logo.jpg" alt="" class="title">
        <a href="${currentTab == "home" ? "./" : "../"}profile.html" target=_self>Profile</a>
        <a href="${currentTab == "home" ? "./" : "../"}blog/blog.html" target=_self>Blog</a>
        <a href="${currentTab == "home" ? "./" : "../"}index.html" target=_self>Home</a>
    `
}

function footer() {
    document.querySelector("footer").insertAdjacentHTML("beforeEnd", 
    ` 
        <div class="footer">
            <a onclick="window.scrollTo(0,0)" style="float: left">Scroll To Top</a>
            <a href="https://boxd.it/9N4xN">Letterboxd</a>
            <a href="https://x.com/flippont">Twitter</a>
            <a href="https://www.albumoftheyear.org/user/flippont/">Album Of The Year</a>
        </div>
    `);
    if(currentTab != "home" && currentPage != "" && currentPage != "index"){    
        s = document.createElement("SCRIPT");
        s.src = "https://utteranc.es/client.js";
        s.setAttribute("repo","flippont/flippont.github.io");
        s.setAttribute("issue-term","pathname");
        s.setAttribute("theme","github-light");
        s.setAttribute("crossorigin","anonymous");
        s.setAttribute("async","");
        if(document.querySelector(".container:last-child"))
        document.querySelector(".container:last-child").appendChild(s);
    }
}

header()
footer()