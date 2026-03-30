const { initializeDatabase } = require("./init.js");

let db = null;

/**
 * Get or initialize the database connection
 * @returns {Database.Database} The database instance
 */
function getDatabase() {
  if (!db) {
    db = initializeDatabase();
  }
  return db;
}

/**
 * Retrieve guild settings from the database
 * @param {string} guildId - The Discord Guild ID
 * @returns {object|null} The guild settings or null if not found
 */
function getSettings(guildId) {
  try {
    const database = getDatabase();
    const stmt = database.prepare("SELECT * FROM guild_settings WHERE guild_id = ?");
    const row = stmt.get(guildId);

    if (!row) {
      return null;
    }

    // Convert integers back to booleans for flag fields
    return {
      guildId: row.guild_id,
      nextSession: row.next_session,
      announcementChannel: row.announcement_channel,
      announcementRole: row.announcement_role,
      dayOfMessageSent: row.day_of_message_sent === 1,
      fiveMinuteWarningSent: row.five_minute_warning_sent === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (error) {
    console.error(`✗ Error retrieving settings for guild ${guildId}:`, error.message);
    throw error;
  }
}

/**
 * Upsert (insert or update) guild settings in the database
 * @param {string} guildId - The Discord Guild ID
 * @param {object} settings - The settings object
 * @param {number} [settings.nextSession] - Unix timestamp of next session
 * @param {string} [settings.announcementChannel] - Channel ID for announcements
 * @param {string} [settings.announcementRole] - Role ID to mention in announcements
 * @param {boolean} [settings.dayOfMessageSent] - Flag for day-of announcement sent
 * @param {boolean} [settings.fiveMinuteWarningSent] - Flag for 5-minute warning sent
 * @returns {void}
 */
function setSettings(guildId, settings) {
  try {
    const database = getDatabase();

    // Check if record exists
    const exists = database.prepare("SELECT 1 FROM guild_settings WHERE guild_id = ?").get(guildId);

    if (exists) {
      // Update existing record
      const stmt = database.prepare(
        `UPDATE guild_settings 
         SET next_session = ?, 
             announcement_channel = ?, 
             announcement_role = ?,
             day_of_message_sent = ?,
             five_minute_warning_sent = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE guild_id = ?`,
      );

      stmt.run(
        settings.nextSession ?? null,
        settings.announcementChannel ?? null,
        settings.announcementRole ?? null,
        settings.dayOfMessageSent ? 1 : 0,
        settings.fiveMinuteWarningSent ? 1 : 0,
        guildId,
      );
    } else {
      // Insert new record
      const stmt = database.prepare(
        `INSERT INTO guild_settings 
         (guild_id, next_session, announcement_channel, announcement_role, day_of_message_sent, five_minute_warning_sent) 
         VALUES (?, ?, ?, ?, ?, ?)`,
      );

      stmt.run(
        guildId,
        settings.nextSession ?? null,
        settings.announcementChannel ?? null,
        settings.announcementRole ?? null,
        settings.dayOfMessageSent ? 1 : 0,
        settings.fiveMinuteWarningSent ? 1 : 0,
      );
    }

    console.log(`✓ Settings saved for guild ${guildId}`);
  } catch (error) {
    console.error(`✗ Error setting settings for guild ${guildId}:`, error.message);
    throw error;
  }
}

/**
 * Delete guild settings from the database
 * @param {string} guildId - The Discord Guild ID
 * @returns {void}
 */
function deleteSettings(guildId) {
  try {
    const database = getDatabase();
    const stmt = database.prepare("DELETE FROM guild_settings WHERE guild_id = ?");
    stmt.run(guildId);
    console.log(`✓ Settings deleted for guild ${guildId}`);
  } catch (error) {
    console.error(`✗ Error deleting settings for guild ${guildId}:`, error.message);
    throw error;
  }
}

/**
 * Retrieve a bot setting from the database
 * @param {string} key - The setting key
 * @returns {string|null} The setting value or null if not found
 */
function getBotSetting(key) {
  try {
    const database = getDatabase();
    const stmt = database.prepare("SELECT value FROM bot_settings WHERE key = ?");
    const row = stmt.get(key);
    return row ? row.value : null;
  } catch (error) {
    console.error(`✗ Error retrieving bot setting ${key}:`, error.message);
    throw error;
  }
}

/**
 * Set a bot setting in the database
 * @param {string} key - The setting key
 * @param {string} value - The setting value
 * @returns {void}
 */
function setBotSetting(key, value) {
  try {
    const database = getDatabase();
    const stmt = database.prepare(
      "INSERT OR REPLACE INTO bot_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
    );
    stmt.run(key, value);
    console.log(`✓ Bot setting ${key} updated`);
  } catch (error) {
    console.error(`✗ Error setting bot setting ${key}:`, error.message);
    throw error;
  }
}

/**
 * Close the database connection
 * @returns {void}
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log("✓ Database connection closed");
  }
}

module.exports = {
  getDatabase,
  getSettings,
  setSettings,
  deleteSettings,
  getBotSetting,
  setBotSetting,
  closeDatabase,
};
