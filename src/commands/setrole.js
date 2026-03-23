const fs = require("node:fs");
const path = require("node:path");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setrole")
    .setDescription("Sets the role to be mentioned in session announcements.")
    .addRoleOption((opt) =>
      opt.setName("role").setDescription("Role to mention").setRequired(true),
    ),
  async execute(interaction) {
    const configPath = path.resolve(__dirname, "..", "config.json");
    const config = require(configPath);

    if (interaction.user.id !== config.owner) {
      return interaction.reply({
        content: "Only the owner can set the announcement role.",
        ephemeral: true,
      });
    }

    const role = interaction.options.getRole("role");

    if (!role)
      return interaction.reply({ content: "Please provide a valid role.", ephemeral: true });

    config.announcementRole = role.id;

    fs.writeFile(configPath, JSON.stringify(config, null, 2), (err) => {
      if (err) {
        console.error("Error writing to config.json:", err);
        return interaction.reply({
          content: "There was an error setting the announcement role.",
          ephemeral: true,
        });
      }

      interaction.reply({
        content: `The announcement role has been set to ${role}.`,
        ephemeral: false,
      });
    });
  },
};
