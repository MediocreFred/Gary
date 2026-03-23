const { SlashCommandBuilder } = require("discord.js");
require("log-timestamp");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("List all of my commands or info about a specific command.")
    .addStringOption((opt) =>
      opt.setName("command").setDescription("Command name").setRequired(false),
    ),
  async execute(interaction) {
    const data = [];
    const { commands } = interaction.client;

    const name = interaction.options.getString("command");
    if (!name) {
      data.push("Here's a list of all my commands:");
      data.push(commands.map((command) => command.data?.name ?? command.name).join(", "));
      return interaction.reply({ content: data.join("\n"), ephemeral: true });
    }

    const command = commands.get(name) || commands.find((c) => c.aliases?.includes(name));
    if (!command)
      return interaction.reply({ content: "that's not a valid command!", ephemeral: true });

    data.push(`Name: ${command.data?.name ?? command.name}`);
    if (command.aliases) data.push(`Aliases: ${command.aliases.join(", ")}`);
    if (command.data?.description) data.push(`Description: ${command.data.description}`);

    interaction.reply({ content: data.join("\n"), ephemeral: true });
  },
};
