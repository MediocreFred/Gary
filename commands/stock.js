const fs = require('fs')
const path = require('path')
const Discord = require('discord.js')
require('log-timestamp')

module.exports = {
  name: 'stock',
  description: 'Posts info about the requested stock symbol',
  cooldown: 5,
  execute (message, args) {
    // Make the API call to get the stock info

    // format the post
    const messageEmbed = new Discord.MessageEmbed()
      .setTitle('')
      .setColor(0xFF0000)

    message.channel.send(messageEmbed).then(() => {
      console.log('Responded to stock function call')
    })
  }
}


