let currentPage = 'home';
// Store loaded pages to avoid refetching
const pages = {};

// script execution (very hacky, I know)
function executeScripts(container) {
    // Find all script tags in the container
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        // Copy attributes
        for (const attr of oldScript.attributes) {
            newScript.setAttribute(attr.name, attr.value);
        }
        // Copy inline script content
        if (oldScript.textContent) {
            newScript.textContent = oldScript.textContent;
        }
        // Remove old script and add new one
        oldScript.parentNode.removeChild(oldScript);
        document.body.appendChild(newScript);
    });
}

function getPageFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') || 'home';
}

function setPageInUrl(page, push = true) {
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    if (push) {
        history.pushState({ page }, '', url);
    } else {
        history.replaceState({ page }, '', url);
    }
}
function loadPage(page, push = true) {
    if (push) {
        setPageInUrl(page, true);
    }
    // If already loaded, use cache
    if (pages[page]) {
        document.querySelector('.container').innerHTML = pages[page];
        executeScripts(document.querySelector('.container'));
    } else {
        document.querySelector('.container').innerHTML = '<div class="loading">Loading...</div>';
        fetch(`https://flippont.github.io/src/pages/${page}.html`)
            .then(response => response.text())
            .then(data => {
                pages[page] = data;
                document.querySelector('.container').innerHTML = data;
                executeScripts(document.querySelector('.container'));
            })
            .catch(error => {
                document.querySelector('.container').innerHTML = '<div class="error">Error loading page.</div>';
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