#!/usr/bin/env node

const { getDatabase, getSettings, setSettings, deleteSettings, getBotSetting, setBotSetting } = require("./db/dal.js");
const fs = require("node:fs");
const path = require("node:path");

// Parse command line arguments
const args = process.argv.slice(2);
let guildId = null;
let resetOwner = false;
let resetGuild = false;

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--guild':
    case '-g':
      guildId = args[++i];
      break;
    case '--reset-owner':
      resetOwner = true;
      break;
    case '--reset-guild':
      resetGuild = true;
      break;
    case '--help':
    case '-h':
      console.log(`
Usage: node reset.js [options]

Options:
  -g, --guild <guildId>    Specify the guild ID to reset settings for
  --reset-owner            Reset the bot owner setting
  --reset-guild            Reset all settings for the specified guild
  -h, --help               Show this help message

Examples:
  node reset.js --reset-owner
  node reset.js --guild 123456789 --reset-guild
  node reset.js --guild 123456789 --reset-guild --reset-owner
`);
      process.exit(0);
      break;
    default:
      console.error(`Unknown option: ${args[i]}`);
      process.exit(1);
  }
}

if (!resetOwner && !resetGuild) {
  console.error("Please specify what to reset: --reset-owner or --reset-guild");
  process.exit(1);
}

if (resetGuild && !guildId) {
  console.error("Guild ID is required for --reset-guild");
  process.exit(1);
}

// Initialize database
getDatabase();

try {
  if (resetOwner) {
    console.log("Resetting bot owner...");
    setBotSetting("owner", null);
    console.log("Bot owner has been reset.");
  }

  if (resetGuild) {
    console.log(`Resetting settings for guild ${guildId}...`);
    deleteSettings(guildId);
    console.log(`Settings for guild ${guildId} have been reset.`);
  }

  console.log("Reset complete.");
} catch (error) {
  console.error("Error during reset:", error.message);
  process.exit(1);
}