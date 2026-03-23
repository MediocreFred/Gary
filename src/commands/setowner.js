const fs = require("node:fs");
const path = require("node:path");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("setowner").setDescription("Sets the owner of the bot."),
  async execute(interaction) {
    const configPath = path.resolve(__dirname, "..", "..", "config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    if (config.owner) {
      return interaction.reply({
        content: "The owner has already been set. Contact the current owner to change it.",
        ephemeral: true,
      });
    }

    const ownerId = interaction.user.id;
    config.owner = ownerId;

    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      interaction.reply({
        content: "You have been set as the owner! You can now use the `/setnext` command.",
        ephemeral: false,
      });
    } catch (err) {
      console.error("Error writing to config.json:", err);
      return interaction.reply({
        content: "There was an error setting the owner.",
        ephemeral: true,
      });
    }
  },
};
