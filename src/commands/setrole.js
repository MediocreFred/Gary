const { SlashCommandBuilder } = require("discord.js");
const { getSettings, setSettings, getBotSetting } = require("../../db/dal.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setrole")
    .setDescription("Sets the role to be mentioned in session announcements.")
    .addRoleOption((opt) =>
      opt.setName("role").setDescription("Role to mention").setRequired(true),
    ),
  async execute(interaction) {
    try {
      // Get owner from database (bot-level config, not guild-specific)
      const owner = getBotSetting("owner");

      if (interaction.user.id !== owner) {
        return interaction.reply({
          content: "Only the owner can set the announcement role.",
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

      const role = interaction.options.getRole("role");

      if (!role) {
        return interaction.reply({ content: "Please provide a valid role.", ephemeral: true });
      }

      // Get existing settings or create new ones
      const existingSettings = getSettings(guildId) || {};
      setSettings(guildId, {
        nextSession: existingSettings.nextSession,
        announcementChannel: existingSettings.announcementChannel,
        announcementRole: role.id,
        dayOfMessageSent: existingSettings.dayOfMessageSent,
        fiveMinuteWarningSent: existingSettings.fiveMinuteWarningSent,
      });

      interaction.reply({
        content: `The announcement role has been set to ${role}.`,
        ephemeral: false,
      });
    } catch (error) {
      console.error("Error in setrole command:", error.message);
      interaction.reply({
        content: "There was an error setting the announcement role.",
        ephemeral: true,
      });
    }
  },
};
