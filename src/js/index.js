let currentPage = 'home';
// Store loaded pages to avoid refetching
const pages = {};

function getPageFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') || 'home';
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
        if ([...document.querySelectorAll(`script[src="${src}"]`)].length > 1) {
            const newScript = document.createElement('script');
            newScript.src = src;
            container.appendChild(newScript);
        }
        oldScript.parentNode.removeChild(oldScript);
    });
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