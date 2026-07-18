import express from "express";
import db from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Simple, fixed list of categories a post can belong to.
const CATEGORIES = ["Tech", "Life", "Tutorial", "Other"];

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); // parses HTML form submissions into req.body
app.use(express.static('public'));

// Rough reading-time estimate: average adult reads ~200 words per minute.
function estimateReadingTime(content) {
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.ceil(wordCount / 200);
    return minutes < 1 ? 1 : minutes;
}

// HOME PAGE - lists posts, supports optional search + category filter
app.get('/', (req, res) => {
    const search = req.query.search ? req.query.search.trim() : '';
    const category = req.query.category || '';

    let query = 'SELECT * FROM posts WHERE 1=1';
    const params = [];

    if (search) {
        query += ' AND (title LIKE ? OR author LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }
    query += ' ORDER BY id DESC';

    const posts = db.prepare(query).all(...params);

    // attach a reading time estimate to each post for display on the homepage
    const postsWithReadingTime = posts.map(post => ({
        ...post,
        readingTime: estimateReadingTime(post.content)
    }));

    res.render('index', {
        posts: postsWithReadingTime,
        search: search,
        category: category,
        categories: CATEGORIES
    });
});

app.get('/create', (req, res) => {
    res.render('create', { categories: CATEGORIES, error: null, formData: {} });
});

app.post('/create', (req, res) => {
    const title = (req.body.title || '').trim();
    const author = (req.body.author || '').trim();
    const content = (req.body.content || '').trim();
    const category = CATEGORIES.includes(req.body.category) ? req.body.category : 'Other';

    // Server-side validation - never trust the client, even though the form already has "required"
    if (!title || !author || !content) {
        return res.status(400).render('create', {
            categories: CATEGORIES,
            error: 'Title, author, and content are all required (and cannot be just spaces).',
            formData: { title, author, content, category }
        });
    }

    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    db.prepare(
        'INSERT INTO posts (title, author, content, category, views, date) VALUES (?, ?, ?, ?, 0, ?)'
    ).run(title, author, content, category, date);

    res.redirect('/');
});

app.get('/post/:id', (req, res) => {
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(parseInt(req.params.id));

    if (!post) {
        return res.status(404).render('404');
    }

    // increment the view counter every time someone opens this post
    db.prepare('UPDATE posts SET views = views + 1 WHERE id = ?').run(post.id);
    post.views += 1;
    post.readingTime = estimateReadingTime(post.content);

    res.render('post', { post: post });
});

app.get('/edit/:id', (req, res) => {
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(parseInt(req.params.id));
    if (!post) {
        return res.status(404).render('404');
    }
    res.render('edit', { post: post, categories: CATEGORIES, error: null });
});

app.post('/edit/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const existingPost = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);

    if (!existingPost) {
        return res.status(404).render('404');
    }

    const title = (req.body.title || '').trim();
    const author = (req.body.author || '').trim();
    const content = (req.body.content || '').trim();
    const category = CATEGORIES.includes(req.body.category) ? req.body.category : 'Other';

    if (!title || !author || !content) {
        return res.status(400).render('edit', {
            post: { ...existingPost, title, author, content, category },
            categories: CATEGORIES,
            error: 'Title, author, and content are all required (and cannot be just spaces).'
        });
    }

    db.prepare(
        'UPDATE posts SET title = ?, author = ?, content = ?, category = ? WHERE id = ?'
    ).run(title, author, content, category, id);

    res.redirect(`/post/${id}`);
});

app.post('/delete/:id', (req, res) => {
    db.prepare('DELETE FROM posts WHERE id = ?').run(parseInt(req.params.id));
    res.redirect('/');
});

// Catch-all for any URL that didn't match a route above -> proper 404 page
app.use((req, res) => {
    res.status(404).render('404');
});

app.listen(PORT, () => {
    console.log(`Blog app running on http://localhost:${PORT}`);
});
