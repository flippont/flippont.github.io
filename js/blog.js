let blogData = null;

let months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Render blog list
function renderBlogList(data) {
    const blogList = document.getElementById('blogList');
    blogList.innerHTML = '';
    data.forEach(post => {
        const card = document.createElement('div');
        card.className = 'blogCard';
        card.style.cursor = 'pointer';
        card.onclick = (e) => {
            window.location.href = './' + post.url + '.html'
        };
        card.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.date ? post.date[0] + 'th ' + months[post.date[1]] + ' ' + post.date[2] : ''}</p>
            <p>${post.excerpt ? post.excerpt : ''}</p>
        `;
        blogList.appendChild(card);
    });
}

fetch('https://flippont.github.io/src/js/blog.json')
    .then(response => response.json())
    .then(data => {
        blogData = data;
        renderBlogList(blogData);
    })
    .catch(() => {
        document.getElementById('blogList').innerText = 'Failed to load blog posts.';
    });
