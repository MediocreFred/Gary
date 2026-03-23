const fs = require("node:fs");
const path = require("node:path");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setchannel")
    .setDescription("Sets the channel for session announcements.")
    .addChannelOption((opt) =>
      opt.setName("channel").setDescription("Channel for announcements").setRequired(true),
    ),
  async execute(interaction) {
    const configPath = path.resolve(__dirname, "..", "..", "config.json");
    const config = require(configPath);

    if (interaction.user.id !== config.owner) {
      return interaction.reply({
        content: "Only the owner can set the announcement channel.",
        ephemeral: true,
      });
    }

    const channel = interaction.options.getChannel("channel");

    if (!channel) {
      return interaction.reply({ content: "Please provide a valid channel.", ephemeral: true });
    }

    config.announcementChannel = channel.id;

    fs.writeFile(configPath, JSON.stringify(config, null, 2), (err) => {
      if (err) {
        console.error("Error writing to config.json:", err);
        return interaction.reply({
          content: "There was an error setting the announcement channel.",
          ephemeral: true,
        });
      }

      interaction.reply({
        content: `The announcement channel has been set to ${channel}.`,
        ephemeral: false,
      });
    });
  },
};
