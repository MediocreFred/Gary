const fs = require('fs');
const { prefix, token } = require('./config.json');
const Discord = require('discord.js');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}


client.on('ready', () => {
    // List servers the bot is connected to
    console.log(`Logged in as ${client.user.tag}!`);
});

// This is where Gary will handle all the messages coming in
client.on('message', (message) => {
    // Prevent bot from responding to its own messages
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'beep') {
        client.commands.get('beep').execute(message, args);
    }
    else if (command === 'kick') {
        client.commands.get('kick').execute(message, args);
    }
    else if (command === 'meme') {
        client.commands.get('meme').execute(message, args);
    }
});

client.login(token);