#!/usr/bin/env node

/**
 * Migration script to transfer data from config.json to SQLite database
 * Usage: node db/migrate.js <guildId>
 */

const fs = require("node:fs");
const path = require("node:path");
const { getSettings, setSettings, closeDatabase } = require("./dal.js");

async function migrateFromConfigJson(guildId) {
  if (!guildId) {
    console.error("✗ Error: Guild ID is required");
    console.log("Usage: node db/migrate.js <guildId>");
    process.exit(1);
  }

  try {
    const configPath = path.resolve(__dirname, "..", "config.json");

    // Check if config.json exists
    if (!fs.existsSync(configPath)) {
      console.error(`✗ Error: config.json not found at ${configPath}`);
      process.exit(1);
    }

    // Read config.json
    console.log("📖 Reading config.json...");
    const configContent = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(configContent);

    // Validate required fields for migration
    if (!config.nextSession && !config.announcementChannel && !config.announcementRole) {
      console.warn("⚠ Warning: config.json appears to be empty or missing guild settings");
    }

    // Prepare settings for database
    const settingsToMigrate = {
      nextSession: config.nextSession || null,
      announcementChannel: config.announcementChannel || null,
      announcementRole: config.announcementRole || null,
      dayOfMessageSent: config.dayOfMessageSent || false,
      fiveMinuteWarningSent: config.fiveMinuteWarningSent || false,
    };

    console.log(`\n📝 Data to migrate to Guild ${guildId}:`);
    console.log(JSON.stringify(settingsToMigrate, null, 2));

    // Check if settings already exist for this guild
    const existingSettings = getSettings(guildId);
    if (existingSettings) {
      console.warn(`\n⚠ Warning: Settings already exist for guild ${guildId}`);
      console.error(
        "✗ Migration aborted to prevent data loss. Delete existing settings first if you want to overwrite.",
      );
      process.exit(1);
    }

    // Migrate data to database
    console.log(`\n🔄 Migrating data to database for guild ${guildId}...`);
    setSettings(guildId, settingsToMigrate);

    // Verify migration
    const migratedSettings = getSettings(guildId);
    if (migratedSettings) {
      console.log("\n✓ Migration successful!");
      console.log("Migrated settings:");
      console.log(JSON.stringify(migratedSettings, null, 2));
    } else {
      console.error("✗ Migration verification failed: Settings not found in database");
      process.exit(1);
    }

    console.log("\n💡 Next steps:");
    console.log("1. Update scheduler.js to use the DAL module");
    console.log("2. Update src/commands/setrole.js to use the DAL module");
    console.log("3. Update src/commands/setnext.js to use the DAL module (if it exists)");
    console.log("4. Update src/commands/setchannel.js to use the DAL module (if it exists)");
    console.log("5. Keep config.json for bot token and clientId (move guild-specific data only)");
  } catch (error) {
    console.error("✗ Migration failed:", error.message);
    if (error instanceof SyntaxError) {
      console.error("   (Invalid JSON in config.json)");
    }
    process.exit(1);
  } finally {
    closeDatabase();
  }
}

// Run migration
const guildId = process.argv[2];
migrateFromConfigJson(guildId);
