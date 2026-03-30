const { SlashCommandBuilder } = require("discord.js");
const { getBotSetting, setBotSetting } = require("../../db/dal.js");

module.exports = {
  data: new SlashCommandBuilder().setName("setowner").setDescription("Sets the owner of the bot."),
  async execute(interaction) {
    const existingOwner = getBotSetting("owner");

    if (existingOwner) {
      return interaction.reply({
        content: "The owner has already been set. Contact the current owner to change it.",
        ephemeral: true,
      });
    }

    const ownerId = interaction.user.id;

    try {
      setBotSetting("owner", ownerId);
      interaction.reply({
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
