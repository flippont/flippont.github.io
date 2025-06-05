let currentPage = 'home';
// Store loaded pages to avoid refetching
const pages = {};

function loadPage(page, push = true) {
    if (currentPage === page) return;
    if (push) {
        history.pushState({ page }, '', `#${page}`);
    }
    // If already loaded, use cache
    if (pages[page]) {
        document.querySelector('.container').innerHTML = pages[page];
    } else {
        fetch(`https://flippont.github.io/src/pages/${page}.html`)
            .then(response => response.text())
            .then(data => {
                pages[page] = data;
                document.querySelector('.container').innerHTML = data;
            })
            .catch(error => console.error('Error loading page:', error));
    }
    currentPage = page;
}

// Handle browser back/forward
window.addEventListener('popstate', (event) => {
    const page = (event.state && event.state.page) || location.hash.replace('#', '') || 'home';
    loadPage(page, false);
});

// On initial load, load the correct page from hash
window.addEventListener('DOMContentLoaded', () => {
    const initialPage = location.hash.replace('#', '') || 'home';
    loadPage(initialPage, false);
});