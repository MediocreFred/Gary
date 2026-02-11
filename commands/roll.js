require('log-timestamp');

// regex that captures the accepted format (example: 1d20)
const re = new RegExp('^[0-9]*d[0-9]+');

module.exports = {
    name: 'roll',
    aliases: ['r'],
    description: 'Rolls as many dice of as many sides as you want',
    usage: 'd20 or 2d6',
    args: true,
    cooldown: 1,
    execute(message, args) {
        console.log(message.author.id, '(' + message.author.username + ')', 'called the !roll command with the arguments ' + args);

        // make it appear that the bot is typing before responding
        if (message.channel?.sendTyping) message.channel.sendTyping();

        // check the arguments are correct
        if (re.test(args) && args.length === 1) {
            const argsList = args[0].split('d');
            const numRolls = argsList[0];
            const numSides = argsList[1];

            // keep track of all the rolls
            const rollResults = [];

            // make sure the request is for 100 rolls or less for performance reasons
            if ((numRolls !== '') && (parseInt(numRolls) <= 100)) {
                // roll the die for each of the requested number of rolls and add to list of results
                for (let i = 0; i < numRolls; i++) {
                    rollResults.push(Math.floor((Math.random() * numSides) + 1));
                }
            }
            else if (numRolls === '') {
                rollResults.push(Math.floor((Math.random() * numSides) + 1));
            }
            else { message.channel.send('Too many rolls requested! (must be <= 100)'); }

            // prepare the roll results for posting
            if (rollResults.length != 0) {
                // sort the results in descending order for better readability
                rollResults.sort((a, b) => b - a);
                // extract each of the rolls in order to make the results pretty for the message
                let prettyResults = String('[');
                for (let i = 0; i < rollResults.length; i++) {
                    prettyResults += rollResults[i];
                    if (i != rollResults.length - 1) {
                        prettyResults += ', ';
                    }
                    else { prettyResults += ']'; }
                }

                // get the total of all the dice rolled
                const rollTotal = rollResults.reduce((a, b) => a + b);

                // stop typing (sendTyping is single-shot, so nothing to stop)

                message.channel.send(message.author.username + '\'s ' + args
                + ' results: ' + '`' + prettyResults + '`\n' + 'Total: ' + '`' + rollTotal + '`');
            }
        }
        else {
            message.channel.send('Correct usage is <#dice>d<#sides>');
        }
        // sendTyping is single-shot; nothing to stop here
    },
};
