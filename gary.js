const config = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    // List servers the bot is connected to
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(config.token);


// This is where Gary will post a meme everyday
const schedule = require('node-schedule');
const meme = require('./post_meme.js');

schedule.scheduleJob('0 10 * * *', function() {
    const embed = new Discord.MessageEmbed();
    meme.post_scheduled_meme(client, embed, 'LotRMemes');
});

schedule.scheduleJob('0 13 * * *', function() {
    const embed = new Discord.MessageEmbed();
    meme.post_scheduled_meme(client, embed, 'TrippinThroughTime');
});

schedule.scheduleJob('0 16 * * *', function() {
    const embed = new Discord.MessageEmbed();
    meme.post_scheduled_meme(client, embed, 'DnDMemes');
});

const store_meme = require('./store_meme.js');

schedule.scheduleJob('0 14 * * *', function() {
    const subreddits = ['Animemes', 'DankMemes', 'DnDMemes', 'LotRMemes', 'Memes', 'PrequelMemes', 'TrippinThroughTime'];
    store_meme.store_memes(subreddits);
});


// Runs once a day to delete any repeat memes
schedule.scheduleJob('05 14 * * *', function() {
    store_meme.delete_duplicates();
});

// This is where Gary will handle all the messages coming in
client.on('message', (message) => {
    // Prevent bot from responding to its own messages
    if (message.author.bot) {
        return;
    }

    // Check if the bot's user was tagged in the message
    if (message.content.includes(client.user.toString())) {
        console.log(message.author.toString(), message.content);
        // Send acknowledgement message
        message.reply('thanks, man!');
        console.log('Replying to message with default reply');
    }
    // Handle different Commands
    if (message.content.startsWith(config.prefix)) {
        try {
            processCommand(message);
        }
        catch(e) {
            console.log(e);
        }
    }
});


// This is where Gary will process commands received via messages

function processCommand(message) {
    // Remove the leading exclamation mark
    const fullCommand = message.content.substr(1);
    // Split the message up in to pieces for each space
    const splitCommand = fullCommand.split(/ +/);
    // The first word directly after the exclamation is the command
    const primaryCommand = splitCommand[0];
    // All other words are arguments/parameters/options for the command
    const args = splitCommand.slice(1);

    console.log('Command received: ' + primaryCommand);
    console.log('Arguments: ' + args);

    let argument_list = new Array();
    // it will look at a response like !2d8 and figure out that it wants 2 8 sided dice rolled
    if (primaryCommand.match(/(\d*)(d)(\d*)/)) {
        argument_list = primaryCommand.match(/(\d*)(d)(\d*)/);
        console.log('Argument List' + argument_list);
        if (argument_list.length == 4 && argument_list[2] == 'd') {
            if (argument_list[1] != '') {
                argument_list[1] = parseInt(argument_list[1]);
            }
            argument_list[3] = parseInt(argument_list[3]);
            rollDiceCommand(argument_list, message);
        }
    }
    else if (primaryCommand == 'meme') {
        // command to post a random meme
        const embed = new Discord.MessageEmbed();
        meme.post_random_meme(message.channel, embed);
    }
    else if (primaryCommand == 'beep') {
        message.channel.send('Boop');
    }
    else if (message.content === `${config.prefix}server`) {
        message.channel.send(`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`);
    }
    else if (primaryCommand === 'kick') {
        // grab the "first" mentioned user from the message
        // this will return a `User` object, just like `message.author`
        if (!message.mentions.users.size) {
            return message.reply('you need to tag a user in order to kick them!');
        }
        const taggedUser = message.mentions.users.first();
        message.channel.send(`Uh oh! What did you do this time? Don't make me kick you, ${taggedUser.username}!`);
    }
    else {
        message.channel.send('I don\'t understand the command. Try `!d20`, `!2d8`, or `!meme`.');
    }
}

function rollDiceCommand(argument_list, message) {
    try {
        if (typeof (argument_list[1]) == 'number' && argument_list[1] != '' && typeof (argument_list[3]) == 'number') {
            const rolls = new Array();
            for (let i = 0; i < argument_list[1]; i++) {
                rolls.push(Math.floor((Math.random() * argument_list[3]) + 1));
            }
            message.channel.send('You rolled ' + rolls);
        }
        else if (typeof (argument_list[1]) != 'number' && typeof (argument_list[3]) == 'number') {
            message.channel.send('You rolled a ' + Math.floor((Math.random() * argument_list[3]) + 1));
        }
    }
    catch(err) {
        console.log('Error handling command request');
        console.log(err.stack);
        message.channel.send('Something is wrong here. Might be me, might be you, I dunno...');
    }
}
