require('log-timestamp');

const re = new RegExp('^[0-9]*d[0-9]+');

module.exports = {
    name: 'roll',
    aliases: ['r'],
    description: 'Rolls as many dice of as many sides as you want',
    usage: 'd20 or 2d6',
    args: true,
    cooldown: 1,
    execute(message, args) {
        if (re.test(args) && args.length === 1) {
            const argsList = args[0].split('d');
            // determine if it is multiple dice or a single die
            if ((argsList[0] !== '') && (parseInt(argsList[0]) <= 100)) {
                const rolls = [];
                for (let i = 0; i < argsList[0]; i++) {
                    rolls.push(Math.floor((Math.random() * argsList[1]) + 1));
                }
                message.channel.send('You rolled ' + rolls);
            }
            else if (argsList[0] === '') {
                message.channel.send('You rolled a ' + Math.floor((Math.random() * argsList[1]) + 1) + ' ');
            }
            else { message.channel.send('Too high of a number'); }

            console.log(message.author.id, '(' + message.author.username + ')', 'called the !roll command with the arguments ' + argsList);
        }
        else {
            message.channel.send('Correct usage is <#dice>d<#sides>');
        }
    },
};
