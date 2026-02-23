const { EmbedBuilder } = require('discord.js');
const meme = require('../privateCommands/post_meme.js');

module.exports = {
    name: 'testmeme',
    description: 'Tests the meme posting functionality.',
    async execute(message, args) {
        const client = message.client;
        const embed = new EmbedBuilder();
        const subreddit = args[0] || 'LotRMemes'; // Default to LotRMemes if no subreddit is provided
        await meme.execute(client, embed, subreddit);
        message.channel.send('Meme test command executed.');
    },
};
