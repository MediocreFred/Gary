# Gary
Gary is a Discord bot made for a D&D group. Currently under active development.

## Requirements
- Node.js >= 22
- A Discord bot token placed in `.env` (`DISCORD_TOKEN` field)
- SQLite database (created automatically on first run)

## Setup

### 1. Install dependencies
```bash
npm install
```

This installs all required packages including `better-sqlite3` for SQLite database support.

### 2. Configure bot credentials
Create/update `.env` with your Discord bot credentials:
```env
DISCORD_TOKEN=YOUR_BOT_TOKEN
CLIENT_ID=YOUR_CLIENT_ID
GUILD_ID=YOUR_GUILD_ID
```

Create/update `config.json` with bot-level settings:
```json
{
  "owner": "YOUR_DISCORD_USER_ID",
  "nextSession": 1774315200,
  "dayOfMessageSent": false,
  "fiveMinuteWarningSent": false
}
```

**Note:** Sensitive credentials are in `.env` (ignored by git). Bot-level settings are in `config.json`. Guild-specific settings (announcement channel, next session time, etc.) are stored in the SQLite database.

### 3. Migrate existing data (if upgrading from config-based storage)
If you have existing guild settings in `config.json`, migrate them to the database:

```bash
node db/migrate.js YOUR_GUILD_ID
```

Replace `YOUR_GUILD_ID` with your Discord server ID. You can find this by enabling Developer Mode in Discord and right-clicking your server.

**Example:**
```bash
node db/migrate.js 532730993962909697
```

The migration script will:
- Read existing guild settings from `config.json`
- Transfer them to `database.db` under the specified guild ID
- Validate data integrity and prevent overwrites

### 4. Run tests and validation
```bash
npm test       # Run test suite
npm run lint   # Check code style
npm run format # Format code
```

## Running the Bot

### Production
```bash
npm start
```

### Development (auto-restart on file changes)
```bash
npm run dev
```

## Database

Gary uses SQLite (`database.db`) for persistent guild configuration. The database is created automatically on first run.

### Guild Settings Schema
```sql
CREATE TABLE guild_settings (
  guild_id TEXT PRIMARY KEY,
  next_session INTEGER,
  announcement_channel TEXT,
  announcement_role TEXT,
  day_of_message_sent INTEGER,
  five_minute_warning_sent INTEGER,
  created_at DATETIME,
  updated_at DATETIME
)
```

### Accessing Guild Settings Programmatically
```javascript
const { getSettings, setSettings } = require("./db/dal.js");

// Get settings for a guild
const settings = getSettings("532730993962909697");

// Update settings
setSettings("532730993962909697", {
  nextSession: 1774315200,
  announcementChannel: "channel-id",
  announcementRole: "role-id",
  dayOfMessageSent: false,
  fiveMinuteWarningSent: false,
});
```

## Commands

The bot uses Discord Slash Commands. Available commands:
- `/setnext` - Set the next session timestamp
- `/setchannel` - Set the announcement channel
- `/setrole` - Set the announcement role to mention
- `/next` - Display the next session time

**Note:** Before using the bot, register these commands with Discord via the Developer Portal or using the deploy script:
```bash
npm run deploy
```

## Architecture

- **`src/index.js`** - Bot entry point and event handlers
- **`src/commands/`** - Slash command implementations
- **`src/events/`** - Discord event listeners
- **`db/init.js`** - Database initialization
- **`db/dal.js`** - Data Access Layer (get/set guild settings)
- **`db/migrate.js`** - Migration tool for config.json → SQLite
- **`scheduler.js`** - Scheduled announcements for sessions
- **`test/`** - Test suites for commands, database, and scheduler

## Notes

- The project uses Discord Slash Commands which require registration with Discord
- Guild-specific data is now persisted in SQLite for multi-guild support
- The bot credential (`token`) and `owner` must be kept in `config.json` for security


