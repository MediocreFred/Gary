const fs = require('fs')
const path = require('path')
const Discord = require('discord.js')
require('log-timestamp')

// files can be found in the directory 'memeData'
const files = ['DnDMemes.txt', 'Memes.txt', 'TrippinThroughTime.txt', 'DankMemes.txt', 'LotRMemes.txt', 'PrequelMemes.txt']
const fileSelection = files[Math.floor(Math.random() * files.length)]
const memes = fs.readFileSync(path.resolve(__dirname, '../memeData', fileSelection)).toString().split('\n')

module.exports = {
  name: 'meme',
  description: 'Posts a random meme',
  cooldown: 10,
  execute (message, args) {
    // message.channel.send('Meme!');
    let meme = ''
    while (meme === '') {
      meme = memes[Math.floor(Math.random() * memes.length)].replace(/[\n\r]/g, '')
    }

    // format the post
    const messageEmbed = new Discord.MessageEmbed()
      .setTitle('Random meme from ' + 'r/' + fileSelection.slice(0, -4))
      .setColor(0xFF0000)
      .setImage(meme)

    message.channel.send(messageEmbed).then(() => {
      console.log('Posted a random meme, ' + meme + ', from ' + fileSelection)
    })
  }
}
