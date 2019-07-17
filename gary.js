const {Client, RichEmbed} = require('discord.js')
const client = new Client()

client.on('ready', () => {
    // List servers the bot is connected to
    console.log(`Logged in as ${client.user.tag}!`)
})

client.login(/*client token goes here*/)


// This is where Gary will post a meme everyday
var schedule = require('node-schedule');
var meme = require('./post_meme.js');
var post_LotRMemes_meme_job = schedule.scheduleJob('0 10 * * *', function () {
    const embed = new RichEmbed()
    meme.post_scheduled_meme(client, embed, "LotRMemes");
});

var post_TrippinThroughTime_meme_job = schedule.scheduleJob('0 13 * * *', function () {
    const embed = new RichEmbed()
    meme.post_scheduled_meme(client, embed, "TrippinThroughTime");
});

var post_DnDMemes_meme_job = schedule.scheduleJob('0 16 * * *', function(){
    const embed = new RichEmbed()    
    meme.post_scheduled_meme(client, embed, "DnDMemes");
});

//var //post_PrequelMemes_meme_job = schedule.scheduleJob('0 19 * * *', function(){
    //const embed = new RichEmbed()    
    //meme.post_scheduled_meme(client, embed, "PrequelMemes");
//});


// This is where Gary will handle all the messages coming in

client.on('message', (receivedMessage) => {
    //~ // Prevent bot from responding to its own messages
    if (receivedMessage.author == client.user) {
        return
    }

    // Check if the bot's user was tagged in the message
    if (receivedMessage.content.includes(client.user.toString())) {
        console.log(receivedMessage.author.toString(),receivedMessage.content)
        // Send acknowledgement message
        receivedMessage.channel.send("Thanks, bro!")
    }
    //Handle different Commands
    if (receivedMessage.content.startsWith("!")) {
        try {
            processCommand(receivedMessage);
        } catch(e) {
            console.log(e)
        }
    }
})


// This is where Gary will process commands received via messages

function processCommand(receivedMessage) {
    let fullCommand = receivedMessage.content.substr(1) // Remove the leading exclamation mark
    let splitCommand = fullCommand.split(" ") // Split the message up in to pieces for each space
    let primaryCommand = splitCommand[0] // The first word directly after the exclamation is the command
    let arguments = splitCommand.slice(1) // All other words are arguments/parameters/options for the command

    console.log("Command received: " + primaryCommand)
    console.log("Arguments: " + arguments) // There may not be any arguments

   var argument_list = new Array();
    //it will look at a response like !2d8 and figure out that it wants 2 8 sided dice rolled
    if (argument_list = primaryCommand.match(/(\d*)(d)(\d*)/)) {
        console.log("Argument List" + argument_list)
        if (argument_list.length == 4 && argument_list[2] == 'd') {
        if (argument_list[1] != '') {
                argument_list[1] = parseInt(argument_list[1]);
        }
        argument_list[3] = parseInt(argument_list[3]);
        rollDiceCommand(argument_list, receivedMessage);
        }
    }
    if (primaryCommand == "meme"){
        //command to post a random meme
        const embed = new RichEmbed()
        meme.post_random_meme(receivedMessage.channel, embed);
    }
    else {
        receivedMessage.channel.send("I don't understand the command. Try `!d20`, '!2d8', or '!meme'.")
    }
}

function rollDiceCommand(argument_list, receivedMessage) {
    try {
        if (typeof(argument_list[1]) == "number" && argument_list[1] != '' && typeof(argument_list[3]) == "number") {
        var rolls = new Array();
        for (i = 0; i < argument_list[1]; i++) {
            rolls.push(Math.floor((Math.random() * argument_list[3]) + 1));
        }
        receivedMessage.channel.send("You rolled " + rolls)
        }
    else if (typeof(argument_list[1]) != "number" && typeof(argument_list[3]) == "number") {
            receivedMessage.channel.send("You rolled a " + Math.floor((Math.random() * argument_list[3]) + 1));
        }
    }
    catch(err) {
    console.log(err.stack);
    receivedMessage.channel.send("Something is wrong here. Might be me, might be you, I dunno...")
    }
}