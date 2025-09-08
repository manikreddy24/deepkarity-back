const initializeDatabase = require('./sqlite');
let db;

async function getDatabase() {
  if (!db) {
    db = await initializeDatabase();
  }
  return db;
}

module.exports = {
  query: async (text, params) => {
    const database = await getDatabase();
    return database.run(text, params);
  },
  get: async (text, params) => {
    const database = await getDatabase();
    return database.get(text, params);
  },
  all: async (text, params) => {
    const database = await getDatabase();
    return database.all(text, params);
  },
  run: async (text, params) => {
    const database = await getDatabase();
    return database.run(text, params);
  }
};