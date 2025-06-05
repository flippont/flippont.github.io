let currentPage = 'home';

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
    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach(oldScript => {
        const src = oldScript.getAttribute('src');
        let shouldInsert = true;
        if (src) {
            // Only insert if no other script with same src exists (except oldScript)
            const allScripts = document.querySelectorAll('script[src]');
            allScripts.forEach(script => {
                if (script !== oldScript && script.getAttribute('src') === src) {
                    shouldInsert = false;
                }
            });
        }
        if (shouldInsert) {
            const newScript = document.createElement('script');
            // Copy attributes
            for (const attr of oldScript.attributes) {
                newScript.setAttribute(attr.name, attr.value);
            }
            // For inline scripts, copy content
            if (!src) {
                newScript.textContent = oldScript.textContent;
            }
            // Replace old script with new one in the DOM
            oldScript.parentNode.replaceChild(newScript, oldScript);
        } else {
            // Just remove the old script if duplicate
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
    document.querySelector('.container').innerHTML = '<div class="loading">Loading...</div>';
    fetch(`https://flippont.github.io/src/pages/${page}.html`)
        .then(response => response.text())
        .then(data => {
            document.querySelector('.container').innerHTML = data;
            executeScripts(document.querySelector('.container'));
        })
        .catch(error => {
            document.querySelector('.container').innerHTML = '<div class="error">Error loading page.</div>';
            console.error('Error loading page:', error);
        });
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
    if (!blogData) return;
    const postParam = getQueryParam('post');
    if (postParam) {
        loadBlogPost(postParam, blogData, false);
    } else {
        renderBlogList(blogData);
    }
});