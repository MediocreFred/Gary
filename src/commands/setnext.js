const fs = require("node:fs");
const path = require("node:path");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setnext")
    .setDescription("Sets the time for the next session.")
    .addStringOption((opt) =>
      opt.setName("when").setDescription("Timestamp or date string").setRequired(true),
    ),
  async execute(interaction) {
    const configPath = path.resolve(__dirname, "..", "..", "config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    if (interaction.user.id !== config.owner) {
      return interaction.reply({
        content: "Only the owner can set the next session time.",
        ephemeral: true,
      });
    }

    const dateString = interaction.options.getString("when");
    let timestamp = Date.parse(dateString);

    // If Date.parse failed, accept a numeric unix timestamp (seconds or ms)
    if (Number.isNaN(timestamp)) {
      if (/^\d+$/.test(dateString)) {
        const num = Number(dateString);
        timestamp = num < 1e12 ? num * 1000 : num;
      }
    }

    if (Number.isNaN(timestamp)) {
      return interaction.reply({
        content: 'Please provide a valid date/time string in the format "YYYY-MM-DD HH:mm".',
        ephemeral: true,
      });
    }

    // Convert to Unix timestamp (seconds)
    const unixTimestamp = Math.floor(timestamp / 1000);

    config.nextSession = unixTimestamp;
    config.dayOfMessageSent = false;
    config.fiveMinuteWarningSent = false;

    fs.writeFile(configPath, JSON.stringify(config, null, 2), (err) => {
      if (err) {
        console.error("Error writing to config.json:", err);
        return interaction.reply({
          content: "There was an error setting the next session.",
          ephemeral: true,
        });
      }

      interaction.reply({
        content: `Next session time has been set! Use the /next command to see it. Here is the raw timestamp for you to verify: <t:${unixTimestamp}:F>`,
        ephemeral: false,
      });
    });
  },
};
