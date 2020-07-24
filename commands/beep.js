module.exports = {
    name: 'beep',
    description: 'Beep Boop!',
    cooldown: 5,
    execute(message, args) {
        message.channel.send('Boop!');
    },
};
