const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kicks a user? (mock)")
    .addUserOption((opt) => opt.setName("target").setDescription("User to kick").setRequired(true)),
  async execute(interaction) {
    const taggedUser = interaction.options.getUser("target");
    if (!taggedUser)
      return interaction.reply({ content: "you need to specify a user to kick!", ephemeral: true });
    await interaction.reply(
      `Uh oh! What did you do this time? Don't make me kick you, ${taggedUser.username}!`,
    );
  },
};
