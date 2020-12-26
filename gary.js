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

const cooldowns = new Discord.Collection();

client.on('ready', () => {
    // List servers the bot is connected to
    console.log(`Logged in as ${client.user.tag}!`);
});

// This is where Gary will handle all the messages coming in
client.on('message', (message) => {
    // Prevent bot from responding to its own messages
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    try {
        command.execute(message, args);
    }
    catch (error) {
        console.error(error);
        return message.reply('there was an error trying to execute that command!');
    }
});

// This is stuff that needs to be fixed to match the new version

// This is where Gary will post a meme everyday
const schedule = require('node-schedule');
const meme = require('./privateCommands/post_meme.js');

schedule.scheduleJob('0 10 * * *', function() {
    const embed = new Discord.MessageEmbed();
    meme.execute(client, embed, 'LotRMemes');
});

schedule.scheduleJob('0 13 * * *', function() {
    const embed = new Discord.MessageEmbed();
    meme.execute(client, embed, 'TrippinThroughTime');
});

schedule.scheduleJob('0 16 * * *', function() {
    const embed = new Discord.MessageEmbed();
    meme.execute(client, embed, 'DnDMemes');
});

const store_meme = require('./privateCommands/store_meme.js');

schedule.scheduleJob('0 14 * * *', function() {
    const subreddits = ['Animemes', 'DankMemes', 'DnDMemes', 'LotRMemes', 'Memes', 'PrequelMemes', 'TrippinThroughTime'];
    store_meme.execute(subreddits);
});


// Runs once a day to delete any repeat memes
schedule.scheduleJob('05 14 * * *', function() {
    store_meme.delete_duplicates();
});

return client.login(token);