# Gary
Gary is a Discord bot made for a D&D group. Currently under active development.

## Requirements
- Node.js >= 22
- A Discord bot token placed in `config.json` (`token` field)

## Quick start
1. Install dependencies:

```bash
npm install
```

2. Run tests and lint/format:

```bash
npm test
npm run lint
npm run format
```

3. Start the bot (production):

```bash
npm start
```

4. Start in development (auto-restarts):

```bash
npm run dev
```

Notes
- The project now uses Discord Slash Commands. Before using the bot you should register the commands with Discord (via the Developer Portal or an automated deploy script). If you'd like, I can add a deploy script to register `src/commands` with Discord.

