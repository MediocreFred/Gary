const fs = require("node:fs");
const path = require("node:path");

module.exports = {
  name: "setrole",
  description: "Sets the role to be mentioned in session announcements.",
  usage: "<@role-name>",
  args: true,
  execute(message, args) {
    const configPath = path.resolve(__dirname, "..", "config.json");
    const config = require(configPath);

    if (message.author.id !== config.owner) {
      return message.reply("Only the owner can set the announcement role.");
    }

    const role = message.mentions.roles.first();

    if (!role) {
      return message.reply("Please mention a valid role.");
    }

    config.announcementRole = role.id;

    fs.writeFile(configPath, JSON.stringify(config, null, 2), (err) => {
      if (err) {
        console.error("Error writing to config.json:", err);
        return message.reply("There was an error setting the announcement role.");
      }

      message.reply(`The announcement role has been set to ${role}.`);
    });
  },
};
