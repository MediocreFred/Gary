const fs = require("node:fs");
const path = require("node:path");
const { SlashCommandBuilder } = require("discord.js");
const { getSettings, setSettings, getBotSetting } = require("../../db/dal.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setchannel")
    .setDescription("Sets the channel for session announcements.")
    .addChannelOption((opt) =>
      opt.setName("channel").setDescription("Channel for announcements").setRequired(true),
    ),
  async execute(interaction) {
    try {
      // Get owner from database (bot-level config, not guild-specific)
      const owner = getBotSetting("owner");

      if (interaction.user.id !== owner) {
        return interaction.reply({
          content: "Only the owner can set the announcement channel.",
          ephemeral: true,
        });
      }

      const guildId = interaction.guildId;
      if (!guildId) {
        return interaction.reply({
          content: "This command can only be used in a server.",
          ephemeral: true,
        });
      }

      const channel = interaction.options.getChannel("channel");

      if (!channel) {
        return interaction.reply({ content: "Please provide a valid channel.", ephemeral: true });
      }

      // Get existing settings or create new ones
      const existingSettings = getSettings(guildId) || {};
      setSettings(guildId, {
        nextSession: existingSettings.nextSession,
        announcementChannel: channel.id,
        announcementRole: existingSettings.announcementRole,
        dayOfMessageSent: existingSettings.dayOfMessageSent,
        fiveMinuteWarningSent: existingSettings.fiveMinuteWarningSent,
      });

      interaction.reply({
        content: `The announcement channel has been set to ${channel}.`,
        ephemeral: false,
      });
    } catch (error) {
      console.error("Error in setchannel command:", error.message);
      interaction.reply({
        content: "There was an error setting the announcement channel.",
        ephemeral: true,
      });
    }
  },
};
