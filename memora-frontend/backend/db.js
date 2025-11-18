/* db.js our is PostgreSQL database where all data is stored permanently.
Our tables: users, flashcard_sets, flashcards.
Only the backend can talk to it.
*/ 

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};