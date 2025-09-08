const initializeDatabase = require('./sqlite');
let db;

function getDatabase() {
  if (!db) {
    db = initializeDatabase();
  }
  return db;
}

module.exports = {
  query: (text, params) => {
    const database = getDatabase();
    if (text.trim().toUpperCase().startsWith('SELECT')) {
      return params ? database.prepare(text).all(params) : database.prepare(text).all();
    } else {
      const result = params ? database.prepare(text).run(params) : database.prepare(text).run();
      return { rows: [], rowCount: result.changes, lastID: result.lastInsertRowid };
    }
  },
  get: (text, params) => {
    const database = getDatabase();
    return params ? database.prepare(text).get(params) : database.prepare(text).get();
  },
  all: (text, params) => {
    const database = getDatabase();
    return params ? database.prepare(text).all(params) : database.prepare(text).all();
  },
  run: (text, params) => {
    const database = getDatabase();
    const result = params ? database.prepare(text).run(params) : database.prepare(text).run();
    return { lastID: result.lastInsertRowid, changes: result.changes };
  }
};