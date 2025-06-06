let currentPage = 'home';

// Track visited URLs in this session
const visitedUrls = new Set();

function getPageFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') || 'home';
}
function getQueryParam(name) {
    const url = new URL(window.location);
    return url.searchParams.get(name);
}
function setPageInUrl(page, push = true) {
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    url.searchParams.delete('post');
    if (push) {
        history.pushState({ page }, '', url);
    } else {
        history.replaceState({ page }, '', url);
    }
}

function executeScripts(container, page = '') {
    const currentUrl = window.location.href;
    if (page && visitedUrls.has(currentUrl)) {
        const funcName = `init_${page}`;
        if (typeof window[funcName] === 'function') {
            window[funcName]();
        }
        return;
    }
    // Try to find and load all scripts if not already loaded, then call init_<filename>()
    const scripts = container.querySelectorAll('script[src]');
    let scriptsToLoad = [];
    scripts.forEach(oldScript => {
        const src = oldScript.getAttribute('src');
        if (src && !document.querySelector(`script[src="${src}"]`)) {
            scriptsToLoad.push(src);
        }
    });

    const scriptings = container.querySelectorAll('script');
    scriptings.forEach(oldScript => {
        const src = oldScript.getAttribute('src');
        if (src) {
            // Only inject if not already visited
            if (!visitedUrls.has(src)) {
                // Remove any existing script with the same src from the document
                const allScripts = document.querySelectorAll(`script[src="${src}"]`);
                allScripts.forEach(script => {
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                });
                const newScript = document.createElement('script');
                newScript.src = src;
                // Copy other attributes if needed
                for (const attr of oldScript.attributes) {
                    if (attr.name !== 'src') {
                        newScript.setAttribute(attr.name, attr.value);
                    }
                }
                document.body.appendChild(newScript);
                visitedUrls.add(src);
            }
        }
        if (oldScript.parentNode) {
            oldScript.parentNode.removeChild(oldScript);
        }
    });
    
    const funcName = `init_${page}`;
    if (typeof window[funcName] === 'function') {
        window[funcName]();
    }
    // Mark this URL as visited after scripts are injected
    if (page) {
        visitedUrls.add(currentUrl);
    }
}

function moveIntoView(element) {
    document.getElementById(element).scrollIntoView();
}

function loadPage(page, push = true) {
    if (push) {
        setPageInUrl(page, true);
    }
    // Always clear container before loading new content
    const container = document.querySelector('.container');
    container.innerHTML = '';
    container.innerHTML = '<div class="loading">Loading...</div>';
    if (page === currentPage) {
        // If loading the same page, just call init_<filename>() if available
        fetch(`https://flippont.github.io/src/pages/${page}.html`)
            .then(response => response.text())
            .then(data => {
                container.innerHTML = data;
                executeScripts(container, page);
            })
            .catch(error => {
                container.innerHTML = '<div class="error">Error loading page.</div>';
                console.error('Error loading page:', error);
            });
    } else {
        fetch(`https://flippont.github.io/src/pages/${page}.html`)
            .then(response => response.text())
            .then(data => {
                container.innerHTML = data;
                executeScripts(container, page);
            })
            .catch(error => {
                container.innerHTML = '<div class="error">Error loading page.</div>';
                console.error('Error loading page:', error);
            });
    }
    currentPage = page;
}

// Handle browser back/forward
window.addEventListener('popstate', (event) => {
    const page = (event.state && event.state.page) || getPageFromUrl();
    loadPage(page, false);
});

// On initial load, load the correct page from query param
window.addEventListener('DOMContentLoaded', () => {
    const initialPage = getPageFromUrl();
    loadPage(initialPage, false);
});