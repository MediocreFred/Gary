const fs = require('node:fs');
const { prefix, token } = require('./config.json');
const { Client, Collection, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    }
    else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}

const cooldowns = new Collection();

// This is where Gary will handle all the messages coming in
client.on('messageCreate', (message) => {
    // Prevent bot from responding to its own messages
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases?.includes(commandName));

    if (!command) return;

    if (command.guildOnly && !message.guild) {
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
        cooldowns.set(command.name, new Collection());
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

schedule.scheduleJob('0 10 * * *', () => {
    const embed = new EmbedBuilder();
    meme.execute(client, embed, 'LotRMemes');
});

schedule.scheduleJob('0 13 * * *', () => {
    const embed = new EmbedBuilder();
    meme.execute(client, embed, 'TrippinThroughTime');
});

schedule.scheduleJob('0 16 * * *', () => {
    const embed = new EmbedBuilder();
    meme.execute(client, embed, 'DnDMemes');
});

const store_meme = require('./privateCommands/store_meme.js');

schedule.scheduleJob('0 14 * * *', () => {
    const subreddits = ['DankMemes', 'DnDMemes', 'LotRMemes', 'Memes', 'PrequelMemes', 'TrippinThroughTime'];
    store_meme.execute(subreddits);
});


// Runs once a day to delete any repeat memes
schedule.scheduleJob('0 23 * * *', () => {
    store_meme.delete_duplicates();
});

return client.login(token);
