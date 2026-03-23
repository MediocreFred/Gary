const fs = require("node:fs");
const path = require("node:path");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("next")
    .setDescription("Displays the time of the next session."),
  async execute(interaction) {
    const configPath = path.resolve(__dirname, "..", "..", "config.json");

    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (error) {
      console.error("Error reading config:", error);
      return interaction.reply({
        content: "There was an error retrieving the schedule.",
        ephemeral: true,
      });
    }

    const timestamp = config.nextSession;

    if (timestamp) {
      await interaction.reply(`The next session is scheduled for <t:${timestamp}:R>`);
    } else {
      await interaction.reply({
        content: "The next session has not been set yet. Use the `/setnext` command to set it.",
        ephemeral: false,
      });
    }
  },
};
