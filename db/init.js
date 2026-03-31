const Database = require("better-sqlite3");
const path = require("node:path");

/**
 * Initialize the SQLite database and create tables
 * @returns {Database.Database} The database instance
 */
function initializeDatabase() {
  try {
    const dbPath = path.resolve(__dirname, "..", "database.db");
    const db = new Database(dbPath);

    // Enable foreign keys
    db.pragma("foreign_keys = ON");

    // Create guild_settings table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS guild_settings (
        guild_id TEXT PRIMARY KEY,
        next_session INTEGER,
        announcement_channel TEXT,
        announcement_role TEXT,
        day_of_message_sent INTEGER DEFAULT 0,
        five_minute_warning_sent INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create bot_settings table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS bot_settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✓ Database initialized successfully");
    return db;
  } catch (error) {
    console.error("✗ Database initialization failed:", error.message);
    throw error;
  }
}

module.exports = {
  initializeDatabase,
};
