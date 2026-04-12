const { SlashCommandBuilder } = require("discord.js");
const { getBotSetting, setBotSetting } = require("../../db/dal.js");

module.exports = {
  data: new SlashCommandBuilder().setName("setowner").setDescription("Sets the owner of the bot."),
  async execute(interaction) {
    // Allow server owner to set the bot owner
    if (interaction.user.id !== interaction.guild.ownerId) {
      return interaction.reply({
        content: "Only the server owner can set the bot owner.",
        ephemeral: true,
      });
    }

    try {
      const existingOwner = getBotSetting("owner");
      if (existingOwner) {
        return interaction.reply({
          content: "The owner has already been set. Contact the current owner to change it.",
          ephemeral: true,
        });
      }

      setBotSetting("owner", interaction.user.id);
      return interaction.reply({
        content: "You have been set as the owner! You can now use the `/setnext` command.",
        ephemeral: false,
      });
    } catch (err) {
      console.error("Error setting owner:", err);
      return interaction.reply({
        content: "There was an error setting the owner.",
        ephemeral: true,
      });
    }
  },
};
