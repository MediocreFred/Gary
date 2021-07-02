require('log-timestamp');

module.exports = {
    name: 'message',
    execute(message) {
        console.log(`${message.author.tag} in #${message.channel.name} sent: ${message.content}`);
        if (message.content.includes(message.client.user['id'])) {
            console.log(message.author.toString(), message.content);
            // Send acknowledgement message
            message.reply(', thats my name, don\'t wear it out!');
            console.log('Replying to message with default reply');
        }
        else { console.log(message.content + ' ' + message.client.user);}
    },
};