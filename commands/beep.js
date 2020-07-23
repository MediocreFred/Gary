module.exports = {
    name: 'beep',
    description: 'Beep Boop!',
    execute(message, args) {
        message.channel.send('Boop!');
    },
};
