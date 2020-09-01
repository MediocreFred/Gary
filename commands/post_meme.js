const config = require('../config.json');
require('log-timestamp');

module.exports = {
    name: 'post top meme',
    description: 'posts',
    execute(client, embed, subreddit) {
        const request = require('request');
        const fs = require('fs');
        const path = require('path');

        request({
            headers: {
                'User-Agent' : 'personal:Gary:v1.1Davout (by /u/broseidon16)',
            },
            uri: 'https://www.reddit.com/r/' + subreddit + '/top/.json?sort=top&t=day&limit=10',
            method: 'GET',
        }, function(err, res, body) {
            const data = JSON.parse(body);
            let index = 0;
            // this loops through to find the first non-text post
            while (data['data']['children'][index]['data']['is_self'] !== false && data['data']['children'][index]['data']['over_18'] !== false && index < 10) {
                index = index + 1;
            }
            // get the post url
            const post_url = 'https://www.reddit.com/r/' + subreddit + '/comments/' + data['data']['children'][index]['data']['id'].replace(/['"]+/g, '');
            // get the image url
            const post_image_url = data['data']['children'][index]['data']['url'].replace(/['"]+/g, '');
            // get the poster's username
            // const post_username = data['data']['children'][index]['data']['author'].replace(/['"]+/g, '');
            // get the post's title
            const post_title = data['data']['children'][index]['data']['title'].replace(/['"]+/g, '');

            // Save the meme
            fs.appendFileSync(path.resolve(__dirname, '../memeData', subreddit + '.txt'), '\n' + post_image_url);

            // Post the meme
            // Place known channel ID in list below
            const channel_list = config.legacy_channels;
            for (const channel of channel_list) {
                const generalChannel = client.channels.cache.get(channel);
                try {
                    // Set the title of the field
                    embed.setTitle('Top post on r/' + subreddit + ' from the past 24 hours');
                    // Set the URL for the embed
                    embed.setURL(post_url);
                    // Set the color of the embed
                    embed.setColor(0xFF0000);
                    // Set the main content of the embed
                    embed.setDescription(post_title);
                    // Set the image of the embed
                    embed.setImage(post_image_url);
                    // Send the embed to the same channel as the message
                    generalChannel.send(embed);
                    console.log('Posted a meme from r/' + subreddit);
                }
                catch(e) {
                    console.log('Error posting the meme:', e.stack);
                }
            }
        });
    },
};