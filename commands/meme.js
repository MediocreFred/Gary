const fs = require("node:fs");
const path = require("node:path");
const { EmbedBuilder } = require("discord.js");
require("log-timestamp");

module.exports = {
  name: "meme",
  description: "Posts a random meme",
  cooldown: 10,
  execute(message, args) {
    // files can be found in the directory 'memeData'
    const files = [
      "DnDMemes.txt",
      "Memes.txt",
      "TrippinThroughTime.txt",
      "DankMemes.txt",
      "LotRMemes.txt",
      "PrequelMemes.txt",
    ];
    const fileSelection = files[Math.floor(Math.random() * files.length)];
    const memes = fs
      .readFileSync(path.resolve(__dirname, "../memeData", fileSelection))
      .toString()
      .split("\n");
    // message.channel.send('Meme!');
    let meme = "";
    while (meme === "") {
      meme = memes[Math.floor(Math.random() * memes.length)].replace(/[\n\r]/g, "");
    }

    // format the post
    const messageEmbed = new EmbedBuilder()
      .setTitle(`Random meme from r/${fileSelection.slice(0, -4)}`)
      .setColor(0xff0000)
      .setImage(meme);

    message.channel.send({ embeds: [messageEmbed] }).then(() => {
      console.log(`Posted a random meme, ${meme}, from ${fileSelection}`);
    });
  },
};
