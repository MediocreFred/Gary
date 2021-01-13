// const fs = require('fs')
// const path = require('path')
const Discord = require('discord.js')
const request = require('request')
require('log-timestamp')
const apiKey = 'ONH4UU86MGB6IAN3' // API key required for access to alphavantage stock api

module.exports = {
  name: 'stock',
  description: 'Posts info about the requested stock symbol',
  aliases: ['s', 'st'],
  usage: '<stock symbol>',
  cooldown: 5,
  execute (message, args) {
    // function to determine if the response is empty
    function isEmptyObject (obj) {
      return !Object.keys(obj).length
    }
    // if the command was called properly
    if (args.length === 1) {
      // get the stock symbol from the message
      const symbol = args[0]
      // Make the API call to get the stock info
      request({
        uri: 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + symbol + '&apikey=' + apiKey,
        method: 'GET'
      }, function (err, res, body) {
        const data = JSON.parse(body) // get the data from the request
        if (!isEmptyObject(data['Global Quote'])) {
          // sort the data from the json response that we want
          // example return here: https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=demo
          const responseBody = data['Global Quote']
          const displaySymbol = responseBody['01. symbol']
          const currentPrice = responseBody['05. price']
          const change = responseBody['09. change']
          const changePercent = responseBody['10. change percent']
          let color = 0x00FF00
          if (change.startsWith('-')) {
            color = 0xFF0000
          }
          // format the post
          const messageEmbed = new Discord.MessageEmbed()
            // .setTitle('$' + displaySymbol)
            .setColor(color)
            .addFields(
              { name: 'Stock Symbol', value: '$' + displaySymbol },
              { name: 'Current Price', value: currentPrice },
              { name: 'Change', value: change, inline: true },
              { name: 'Percent Change', value: changePercent, inline: true }
            )
            .setTimestamp()
            .setFooter('Info provided through AlphaVantage API')

          message.channel.send(messageEmbed).then(() => {
            console.log('Posted stock information for ' + displaySymbol)
          })
        } else {
          message.channel.send('No stock was found for: ' + symbol + '. Please enter a valid stock symbol.')
        }
      })
    } else {
      message.channel.send('Please enter a valid stock symbol.')
    }
  }
}
