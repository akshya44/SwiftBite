const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.NODE_ENV === 'production'
  ? '/tmp/database.sqlite'
  : path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      _id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      address TEXT DEFAULT '',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS restaurants (
      _id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      cuisineType TEXT NOT NULL,
      imageUrl TEXT DEFAULT '',
      rating REAL DEFAULT 4.0,
      isOpen INTEGER DEFAULT 1,
      ownerId TEXT NOT NULL,
      address TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ownerId) REFERENCES users (_id)
    );
    
    CREATE TABLE IF NOT EXISTS menu_items (
      _id TEXT PRIMARY KEY,
      restaurantId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      price REAL NOT NULL,
      category TEXT NOT NULL,
      imageUrl TEXT DEFAULT '',
      isAvailable INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (restaurantId) REFERENCES restaurants (_id)
    );
    
    CREATE TABLE IF NOT EXISTS orders (
      _id TEXT PRIMARY KEY,
      customerId TEXT NOT NULL,
      restaurantId TEXT NOT NULL,
      items TEXT NOT NULL, -- Stored as JSON
      totalAmount REAL NOT NULL,
      deliveryAddress TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customerId) REFERENCES users (_id),
      FOREIGN KEY (restaurantId) REFERENCES restaurants (_id)
    );
  `);
};

module.exports = { db, initDb };
