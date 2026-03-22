const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    name: 'setowner',
    description: 'Sets the owner of the bot. Only the owner can set the next session time.',
    execute(message, args) {
        const configPath = path.resolve(__dirname, '..', 'config.json');
        const config = require(configPath);

        if (config.owner) {
            return message.reply('The owner has already been set. Contact the current owner to change it.');
        }

        const ownerId = message.author.id;
        config.owner = ownerId;

        fs.writeFile(configPath, JSON.stringify(config, null, 2), (err) => {
            if (err) {
                console.error('Error writing to config.json:', err);
                return message.reply('There was an error setting the owner.');
            }

            message.reply(`You have been set as the owner! You can now use the `setnext` command.`);
        });
    },
};
