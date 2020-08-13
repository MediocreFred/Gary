require('log-timestamp');

const re = new RegExp('^[0-9]*d[0-9]+');

module.exports = {
    name: 'roll',
    description: 'Rolls as many dice of as many sides as you want',
    usage: '<#dice>d<#sides>',
    args: true,
    cooldown: 1,
    execute(message, args) {
        if (re.test(args) && args.length == 1) {
            const args_list = args[0].split('d');
            // determine if it is multple dice or a single die
            if ((args_list[0] != '') && (parseInt(args_list[0]) <= 100)) {
                const rolls = new Array();
                for (let i = 0; i < args_list[0]; i++) {
                    rolls.push(Math.floor((Math.random() * args_list[1]) + 1));
                }
                message.channel.send('You rolled ' + rolls);
            }
            else if (args_list[0] == '') {
                message.channel.send('You rolled a ' + Math.floor((Math.random() * args_list[1]) + 1));
            }
            else { message.channel.send('Too high of a number'); }

            console.log(message.author.id, '(' + message.author.username + ')', 'called the !roll command with the arguments ' + args_list);
        }
        else {
            message.channel.send('Correct usage is <#dice>d<#sides>');
        }
    },
};

/*
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
*/