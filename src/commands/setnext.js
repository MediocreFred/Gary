const { SlashCommandBuilder } = require("discord.js");
const chrono = require("chrono-node");
const { getSettings, setSettings, getBotSetting } = require("../../db/dal.js");

function parseNaturalDateTime(dateString) {
  const referenceDate = new Date();
  const parsedResult = chrono.parse(dateString, referenceDate, { forwardDate: true });

  if (!parsedResult || parsedResult.length === 0 || !parsedResult[0].start) {
    return null;
  }

  const parsedDate = parsedResult[0].start.date();
  if (!(parsedDate instanceof Date) || Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const includesYear = /\b\d{4}\b/.test(dateString);
  if (!includesYear && parsedDate < referenceDate) {
    parsedDate.setFullYear(parsedDate.getFullYear() + 1);
  }

  return parsedDate;
}

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
      let timestamp = NaN;

      if (/^\d+$/.test(dateString)) {
        const num = Number(dateString);
        timestamp = num < 1e12 ? num * 1000 : num;
      }

      if (Number.isNaN(timestamp)) {
        const parsedDate = parseNaturalDateTime(dateString);
        if (parsedDate) {
          timestamp = parsedDate.getTime();
        }
      }

      if (Number.isNaN(timestamp)) {
        const parsedIso = Date.parse(dateString);
        if (!Number.isNaN(parsedIso)) {
          timestamp = parsedIso;
        }
      }

      if (Number.isNaN(timestamp)) {
        return interaction.reply({
          content: 'Please provide a valid date/time expression like "tomorrow at 8pm", "next Friday", or "3/23 8pm".',
          ephemeral: true,
        });
      }

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
        content: `Next session time has been set! Here is the interpreted session time for verification: <t:${unixTimestamp}:F>`,
        ephemeral: true,
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
