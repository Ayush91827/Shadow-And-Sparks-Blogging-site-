# Shadows & Sparks — Updated Blog App

Same tech stack (Node.js + Express + EJS + CSS), same design/look — just fixed and improved.

## How to run it
```bash
npm install
npm start
```
Then open http://localhost:3000

`better-sqlite3` will automatically create a `blog.db` file in this folder the first time you run it — that's your permanent storage. Delete `blog.db` any time to start fresh with an empty blog.

## What was added (new features)
1. **Persistent storage (SQLite)** — posts now survive a server restart. Previously they lived only in a JavaScript array in memory.
2. **Search bar** — search posts by title or author from the homepage.
3. **Categories** — every post has a category (Tech / Life / Tutorial / Other); filter the homepage by category.
4. **View counter** — each post tracks how many times it's been opened.
5. **Reading time estimate** — calculated from word count (~200 words/minute), shown on the homepage and post page.
6. **Server-side validation** — empty or whitespace-only submissions are rejected with an error message, instead of silently creating a blank post.
7. **Proper 404 page** — visiting a deleted/nonexistent post, or any unknown URL, now shows a real "not found" page instead of silently redirecting home.

## Bugs that were fixed
1. **`post.data` typo** in `post.ejs` — should have been `post.date`. The date silently failed to display on the post detail page.
2. **Homepage date/author not displaying** — `index.ejs` used `<% post.date %>` / `<% post.author %>` (no `=`), which runs the code but never outputs it. Fixed to `<%= %>`.
3. **Broken delete button** — the delete form's `action="/delete/<% post.id %>"` was missing `=`, so it posted to `/delete/` with no id and never actually deleted the right post.
4. **Broken "Cancel" link on the edit page** — same missing-`=` issue, linked to `/post/` with no id.
5. **Invalid `type="int"` on the title input** in `create.ejs` — not a real HTML input type; changed to `type="text"`.
6. **Copyright year not displaying** in the footer — same missing-`=` bug.
7. **Stored XSS vulnerability** — `post.ejs` used to render post content with `<%- %>` (raw, unescaped HTML) so it could inject `<br>` tags for line breaks. That meant anyone could submit a post containing a `<script>` tag and it would run in every visitor's browser. Fixed by using `<%= %>` (escaped output) and handling line breaks with a CSS rule (`white-space: pre-line`) instead — same visual result, no security hole.

## Files changed
- `server.js` — rewritten to use SQLite instead of an in-memory array, plus search/filter logic, validation, view counting, and a 404 handler.
- `db.js` — new file, sets up the SQLite database and table.
- `views/*.ejs` — all updated with bug fixes and new UI for search/categories/reading time/views.
- `views/404.ejs` — new file, the error page.
- `public/styles.css` — same design, with a few new rules added for the search bar, category badges, and error banner (nothing existing was removed or changed visually).
