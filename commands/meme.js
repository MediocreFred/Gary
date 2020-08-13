const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
require('log-timestamp');

// files can be found in the directory 'memeData'
const files = ['Animemes.txt', 'DnDMemes.txt', 'Memes.txt', 'TrippinThroughTime.txt', 'DankMemes.txt', 'LotRMemes.txt', 'PrequelMemes.txt'];
const file_selection = files[Math.floor(Math.random() * files.length)];
const memes = fs.readFileSync(path.resolve(__dirname, '../memeData', file_selection)).toString().split('\n');

module.exports = {
    name: 'meme',
    description: 'Posts a random meme',
    cooldown: 10,
    execute(message, args) {
        // message.channel.send('Meme!');
        let meme = '';
        while(meme == '') {
            meme = memes[Math.floor(Math.random() * memes.length)];
        }

        // format the post
        const messageEmbed = new Discord.MessageEmbed()
            .setTitle('Random meme from ' + 'r/' + file_selection.slice(0, -4))
            .setColor(0xFF0000)
            .setImage(meme);
        message.channel.send(messageEmbed);
        console.log('Posted a random meme, ' + meme + ', from ' + file_selection);
    },
};
