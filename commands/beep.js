module.exports = {
    name: 'beep',
    aliases: ['boop'],
    description: 'Beep Boop!',
    cooldown: 1,
    execute(message, args) {
        message.channel.send('Boop!');
    },
};
