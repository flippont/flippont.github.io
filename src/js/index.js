let currentPage = 'home';

function getPageFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') || 'home';
}

// Utility to get query param
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

function executeScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
        const src = oldScript.getAttribute('src');
        let duplicate = false;
        if (src) {
            const allScripts = document.querySelectorAll('script[src]');
            allScripts.forEach(script => {
                if (script !== oldScript && script.getAttribute('src') === src) {
                    duplicate = true;
                }
            });
        }
        if (src && !duplicate) {
            const newScript = document.createElement('script');
            newScript.src = src;
            for (const attr of oldScript.attributes) {
                if (attr.name !== 'src') {
                    newScript.setAttribute(attr.name, attr.value);
                }
            }
            document.body.appendChild(newScript);
        } else if (!src) {
            // Execute inline script code
            try {
                eval(oldScript.textContent);
            } catch (e) {
                console.error('Error executing inline script:', e);
            }
        }
        if (oldScript.parentNode) {
            oldScript.parentNode.removeChild(oldScript);
        }
    });
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
    fetch(`https://flippont.github.io/src/pages/${page}.html`)
        .then(response => response.text())
        .then(data => {
            container.innerHTML = data;
            executeScripts(container);
        })
        .catch(error => {
            container.innerHTML = '<div class="error">Error loading page.</div>';
            console.error('Error loading page:', error);
        });
    currentPage = page;
}

// Handle browser back/forward
window.addEventListener('popstate', (event) => {
    const page = (event.state && event.state.page) || getPageFromUrl();
    loadPage(page, false);
    if (!blogData) return;
    const postParam = getQueryParam('post');
    if (postParam) {
        loadBlogPost(postParam, blogData, false);
    } else {
        renderBlogList(blogData);
    }
});

// On initial load, load the correct page from query param
window.addEventListener('DOMContentLoaded', () => {
    const initialPage = getPageFromUrl();
    loadPage(initialPage, false);
});