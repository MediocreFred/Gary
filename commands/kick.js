module.exports = {
    name: 'kick',
    description: 'Kicks a user?',
    usage: '<user>',
    guildOnly: true,
    args: true,
    cooldown: 10,
    execute(message, args) {
        if (!message.mentions.users.size) {
            return message.reply('you need to tag a user in order to kick them!');
        }
        const taggedUser = message.mentions.users.first();
        message.channel.send(`Uh oh! What did you do this time? Don't make me kick you, ${taggedUser.username}!`);
    },
};