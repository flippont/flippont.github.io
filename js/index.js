let currentTab = "home";
let currentPage = "";
location.pathname.replace(/([^\/]*?)\/([^\/]*?)(\.html)?$/, (z,a,b,c) => { if(a) currentTab = a; if(b) currentPage = b; });
if(currentTab == "flippont.github.io" && (page == "" || page == "index")){
    currentTab = "home";
}

function header() {
    document.title = `Flippont / ${currentTab} / ${currentPage}`;
    // Hamburger menu HTML
    const navLinks = `
        <a href="${currentTab == "home" ? "./" : "../"}profile.html" target=_self>Profile</a>
        <a href="${currentTab == "home" ? "./" : "../"}blog/blog.html" target=_self>Blog</a>
        <a href="${currentTab == "home" ? "./" : "../"}index.html" target=_self>Home</a>
    `;
    document.querySelector("header").innerHTML = `
        <img src="${currentTab == "home" ? "./" : "../"}images/logo.jpg" alt="" class="title">
        <nav class="desktop-nav">${navLinks}</nav>
        <div class="mobile-nav">
            <button id="hamburger" aria-label="Open navigation">&#9776;</button>
            <div id="mobileMenu" class="mobile-menu" style="display:none;">
                ${navLinks}
            </div>
        </div>
    `;

    // Hamburger menu toggle logic
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobileMenu");
    if (hamburger && mobileMenu) {
        hamburger.onclick = () => {
            mobileMenu.style.display = mobileMenu.style.display === "block" ? "none" : "block";
        };
        // Optional: Hide menu when clicking outside
        document.addEventListener("click", function(e) {
            if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.style.display = "none";
            }
        });
    }
}

function footer() {
    document.querySelector("footer").insertAdjacentHTML("beforeEnd", 
    ` 
        <div class="footer">
            <a onclick="window.scrollTo(0,0)">Scroll To Top</a>
            <a href="https://boxd.it/9N4xN" target="_blank">Letterboxd</a>
            <a href="https://github.com/flippont" target="_blank">GitHub</a>
            <a href="https://www.albumoftheyear.org/user/flippont/" target="_blank">Album Of The Year</a>
        </div>
    `);
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
}

header()
footer()