require("log-timestamp");

// regex that captures the accepted format (example: 1d20)
const re = /^[0-9]*d[0-9]+/;
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Rolls as many dice of as many sides as you want")
    .addStringOption((opt) =>
      opt.setName("dice").setDescription("dice expression like 2d6").setRequired(true),
    ),
  async execute(interaction) {
    const args = [interaction.options.getString("dice")];
    const user = interaction.user;

    // make it appear that the bot is typing before responding
    if (interaction.channel?.sendTyping) interaction.channel.sendTyping();

    if (re.test(args) && args.length === 1) {
      const argsList = args[0].split("d");
      const numRolls = argsList[0];
      const numSides = argsList[1];

      const rollResults = [];

      if (numRolls !== "" && Number.parseInt(numRolls) <= 100) {
        for (let i = 0; i < numRolls; i++) {
          rollResults.push(Math.floor(Math.random() * numSides + 1));
        }
      } else if (numRolls === "") {
        rollResults.push(Math.floor(Math.random() * numSides + 1));
      } else {
        return interaction.reply({
          content: "Too many rolls requested! (must be <= 100)",
          ephemeral: true,
        });
      }

      if (rollResults.length !== 0) {
        rollResults.sort((a, b) => b - a);
        let prettyResults = String("[");
        for (let i = 0; i < rollResults.length; i++) {
          prettyResults += rollResults[i];
          if (i !== rollResults.length - 1) {
            prettyResults += ", ";
          } else {
            prettyResults += "]";
          }
        }

        const rollTotal = rollResults.reduce((a, b) => a + b);

        await interaction.reply(
          `${user.username}'s ${args} results: \`${prettyResults}\`\nTotal: \`${rollTotal}\``,
        );
      }
    } else {
      interaction.reply({ content: "Correct usage is <#dice>d<#sides>", ephemeral: true });
    }
  },
};
