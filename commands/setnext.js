const fs = require("node:fs");
const path = require("node:path");

module.exports = {
  name: "setnext",
  description: "Sets the time for the next session.",
  usage: '<"YYYY-MM-DD HH:mm">',
  args: true,
  execute(message, args) {
    const configPath = path.resolve(__dirname, "..", "config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    if (message.author.id !== config.owner) {
      return message.reply("Only the owner can set the next session time.");
    }

    const dateString = args.join(" ");
    let timestamp = Date.parse(dateString);

    // If Date.parse failed, accept a numeric unix timestamp (seconds or ms)
    if (Number.isNaN(timestamp)) {
      if (/^\d+$/.test(dateString)) {
        const num = Number(dateString);
        timestamp = num < 1e12 ? num * 1000 : num;
      }
    }

    if (Number.isNaN(timestamp)) {
      return message.reply(
        'Please provide a valid date/time string in the format "YYYY-MM-DD HH:mm".',
      );
    }

    // Convert to Unix timestamp (seconds)
    const unixTimestamp = Math.floor(timestamp / 1000);

    config.nextSession = unixTimestamp;
    config.dayOfMessageSent = false;
    config.fiveMinuteWarningSent = false;

    fs.writeFile(configPath, JSON.stringify(config, null, 2), (err) => {
      if (err) {
        console.error("Error writing to config.json:", err);
        return message.reply("There was an error setting the next session.");
      }

      message.reply(
        `Next session time has been set! Use the !next command to see it. Here is the raw timestamp for you to verify: <t:${unixTimestamp}:F>`,
      );
    });
  },
};
