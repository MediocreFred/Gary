const config = require('../config.json');
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    // List servers the bot is connected to
    console.log('Servers:');
    client.guilds.forEach((guild) => {
        console.log(' - ' + guild.name);

        // List all channels
        guild.channels.forEach((channel) => {
            console.log(` -- ${channel.name} (${channel.type}) - ${channel.id}`);
        });
    });
});

client.login(config.token);
