let blogData = null;

let months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Add sort dropdown
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('blogSort').addEventListener('change', () => {
        if (blogData) {
            renderBlogList(blogData);
        }
    });
});

// Render blog list with sorting
function renderBlogList(data) {
    const blogList = document.getElementById('blogList');
    blogList.innerHTML = '';
    // Get sort option
    const sortSelect = document.getElementById('blogSort');
    let sorted = [...data];
    if (sortSelect) {
        if (sortSelect.value === 'date') {
            // Sort by date, newest first
            sorted.sort((a, b) => {
                if (!a.date) return 1;
                if (!b.date) return -1;
                // date: [day, monthIndex, year]
                const da = new Date(a.date[2], a.date[1], a.date[0]);
                const db = new Date(b.date[2], b.date[1], b.date[0]);
                return db - da;
            });
        } else if (sortSelect.value === 'alpha') {
            // Sort alphabetically by title
            sorted.sort((a, b) => {
                if (!a.title) return 1;
                if (!b.title) return -1;
                return a.title.localeCompare(b.title);
            });
        }
    }
    sorted.forEach(post => {
        const card = document.createElement('div');
        card.className = 'blogCard';
        card.style.cursor = 'pointer';
        card.onclick = (e) => {
            window.location.href = './' + post.url + '.html'
        };
        card.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.date ? post.date[0] + 'th ' + months[post.date[1] - 1] + ' ' + post.date[2] : ''}</p>
            <p>${post.excerpt ? post.excerpt : ''}</p>
        `;
        blogList.appendChild(card);
    });
}

fetch('../js/blog.json')
    .then(response => response.json())
    .then(data => {
        blogData = data;
        renderBlogList(blogData);
    })
    .catch(() => {
        document.getElementById('blogList').innerText = 'Failed to load blog posts.';
    });
