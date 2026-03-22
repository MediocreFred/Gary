const fs = require("node:fs");
const path = require("node:path");

module.exports = {
  name: "setchannel",
  description: "Sets the channel for session announcements.",
  usage: "<#channel-name>",
  args: true,
  execute(message, args) {
    const configPath = path.resolve(__dirname, "..", "config.json");
    const config = require(configPath);

    if (message.author.id !== config.owner) {
      return message.reply("Only the owner can set the announcement channel.");
    }

    const channel = message.mentions.channels.first();

    if (!channel) {
      return message.reply("Please mention a valid channel.");
    }

    config.announcementChannel = channel.id;

    fs.writeFile(configPath, JSON.stringify(config, null, 2), (err) => {
      if (err) {
        console.error("Error writing to config.json:", err);
        return message.reply("There was an error setting the announcement channel.");
      }

      message.reply(`The announcement channel has been set to ${channel}.`);
    });
  },
};
