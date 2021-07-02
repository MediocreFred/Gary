require('log-timestamp');

module.exports = {
    name: 'message',
    execute(message) {
        console.log(`${message.author.tag} in #${message.channel.name} sent: ${message.content}`);

        if (message.content.includes(message.client.user['id'])) {

            // make bot appear to be typing for a little before answering
            message.channel.startTyping();
            message.channel.stopTyping();

            console.log(message.author.toString(), message.content);

            // Send acknowledgement message
            message.reply('thats my name, don\'t wear it out!');
            console.log('Replying to message with default reply');
        }
        if ((message.content === 'Yikes') || (message.content === 'yikes')) {
            // make bot appear to be typing for a little before answering
            message.channel.startTyping();
            message.channel.stopTyping();

            message.channel.send('Yikes indeed!');
            console.log('Yikes');
        }
    },
};