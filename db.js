import Database from "better-sqlite3";

// Creates blog.db in the project folder if it doesn't already exist.
// This is what makes posts survive a server restart.
const db = new Database("blog.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'Other',
    views INTEGER DEFAULT 0,
    date TEXT NOT NULL
  )
`);

export default db;
