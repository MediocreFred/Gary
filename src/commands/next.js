const { SlashCommandBuilder } = require("discord.js");
const { getSettings } = require("../../db/dal.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("next")
    .setDescription("Displays the time of the next session."),
  async execute(interaction) {
    const guildId = interaction.guildId;
    if (!guildId) {
      return interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
    }

    try {
      const settings = getSettings(guildId);
      const timestamp = settings?.nextSession;

      if (timestamp) {
        await interaction.reply(
          `The next session is scheduled for <t:${timestamp}:F> (<t:${timestamp}:R>)`,
        );
      } else {
        await interaction.reply({
          content: "The next session has not been set yet. Use the `/setnext` command to set it.",
          ephemeral: false,
        });
      }
    } catch (error) {
      console.error("Error retrieving schedule:", error);
      await interaction.reply({
        content: "There was an error retrieving the schedule.",
        ephemeral: true,
      });
    }
  },
};
