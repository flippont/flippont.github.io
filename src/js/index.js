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
        if (src) {
            // Extract filename without extension for init function naming
            const match = src.match(/([^\/]+)\.js$/);
            const baseName = match ? match[1] : null;
            // Remove any existing script with the same src from the document
            const allScripts = document.querySelectorAll(`script[src="${src}"]`);
            if (allScripts.length > 0) {
                // If script is already loaded, call its init function if available
                if (baseName && typeof window[`init_${baseName}`] === 'function') {
                    window[`init_${baseName}`]();
                }
            } else {
                const newScript = document.createElement('script');
                newScript.src = src;
                // Copy other attributes if needed
                for (const attr of oldScript.attributes) {
                    if (attr.name !== 'src') {
                        newScript.setAttribute(attr.name, attr.value);
                    }
                }
                // When script loads, call its init function if available
                if (baseName) {
                    newScript.onload = function() {
                        if (typeof window[`init_${baseName}`] === 'function') {
                            window[`init_${baseName}`]();
                        }
                    };
                }
                document.body.appendChild(newScript);
            }
        }
        // Only remove if still attached to DOM
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