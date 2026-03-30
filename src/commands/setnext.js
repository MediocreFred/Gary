const { SlashCommandBuilder } = require("discord.js");
const { getSettings, setSettings, getBotSetting } = require("../../db/dal.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setnext")
    .setDescription("Sets the time for the next session.")
    .addStringOption((opt) =>
      opt.setName("when").setDescription("Timestamp or date string").setRequired(true),
    ),
  async execute(interaction) {
    try {
      // Get owner from database (bot-level config, not guild-specific)
      const owner = getBotSetting("owner");

      if (interaction.user.id !== owner) {
        return interaction.reply({
          content: "Only the owner can set the next session time.",
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

      // Get existing settings or create new ones
      const existingSettings = getSettings(guildId) || {};
      setSettings(guildId, {
        nextSession: unixTimestamp,
        announcementChannel: existingSettings.announcementChannel,
        announcementRole: existingSettings.announcementRole,
        dayOfMessageSent: false,
        fiveMinuteWarningSent: false,
      });

      interaction.reply({
        content: `Next session time has been set! Use the /next command to see it. Here is the raw timestamp for you to verify: <t:${unixTimestamp}:F>`,
        ephemeral: false,
      });
    } catch (error) {
      console.error("Error in setnext command:", error.message);
      interaction.reply({
        content: "There was an error setting the next session.",
        ephemeral: true,
      });
    }
  },
};
