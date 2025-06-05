let blogData = null;

let months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Utility to get query param
function getQueryParam(name) {
    const url = new URL(window.location);
    return url.searchParams.get(name);
}

// Render blog list
function renderBlogList(data) {
    const blogList = document.getElementById('blogList');
    blogList.innerHTML = '';
    document.querySelector('.blogIndex').innerHTML = `
        Blog
    `;
    data.forEach(post => {
        const card = document.createElement('div');
        card.className = 'blogCard';
        card.style.cursor = 'pointer';
        card.onclick = (e) => {
            e.preventDefault();
            loadBlogPost(post.url, data, true);
        };
        card.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.date ? post.date[0] + 'th ' + months[post.date[1]] + ' ' + post.date[2] : ''}</p>
            <p>${post.excerpt ? post.excerpt : ''}</p>
        `;
        blogList.appendChild(card);
    });
}

// Render a single blog post
function loadBlogPost(postUrl, data, pushState) {
    const blogList = document.getElementById('blogList');
    blogList.innerHTML = 'Loading...';
    fetch(`https://flippont.github.io/src/blog/${postUrl}.html`)
        .then(res => res.text())
        .then(html => {
            // Add a back button above the blog content
            document.querySelector('.blogIndex').innerHTML = `
                <span id="backToList">Blog</span> > ${postUrl}
            `;
            blogList.innerHTML = html;
            document.getElementById('backToList').onclick = () => {
                // Remove only the post query param, keep others
                const url = new URL(window.location);
                url.searchParams.delete('post');
                history.pushState({type: 'list'}, '', url);
                renderBlogList(data);
            };
            executeScripts(blogList);
            // Update URL for direct linking, preserving other params
            if (pushState) {
                const url = new URL(window.location);
                url.searchParams.set('post', postUrl);
                history.pushState({type: 'post', postUrl}, '', url);
            }
        })
        .catch(() => {
            blogList.innerHTML = 'Failed to load blog post.';
        });
}

fetch('https://flippont.github.io/src/js/blog.json')
    .then(response => response.json())
    .then(data => {
        blogData = data;
        init_blog()
    })
    .catch(() => {
        document.getElementById('blogList').innerText = 'Failed to load blog posts.';
    });


function init_blog() {
    const postParam = getQueryParam('post');
    if (postParam) {
        loadBlogPost(postParam, blogData, false);
    } else {
        renderBlogList(blogData);
    }
}