const FileDb = require('./fileDb');
let dbInstance;

async function getDatabase() {
  if (!dbInstance) {
    dbInstance = new FileDb();
    await dbInstance.init();
  }
  return dbInstance;
}

module.exports = {
  query: async (text, params) => {
    const db = await getDatabase();
    return db.all(text, params);
  },
  get: async (text, params) => {
    const db = await getDatabase();
    return db.get(text, params);
  },
  all: async (text, params) => {
    const db = await getDatabase();
    return db.all(text, params);
  },
  run: async (text, params) => {
    const db = await getDatabase();
    return db.run(text, params);
  }
};