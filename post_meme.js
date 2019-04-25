
module.exports = {
    post_meme : function(client, embed, subreddit){
        var request = require('request');
        var fs = require('fs');

        request({
            headers: {
                'User-Agent' : 'personal:Gary:Soult (by /u/broseidon16)'
            },
            uri: 'https://www.reddit.com/r/' + subreddit + '/top/.json?sort=top&t=day&limit=10',
            method: 'GET'
          }, function (err, res, body) {
            var data = JSON.parse(body); 
            var index = 0;
            while(data['data']['children'][index]['data']['is_self'] != false && index < 10){ //this loops through to find the first non-text post
                index = index+1;
            }
            //get the post url
            var post_url = "https://www.reddit.com/r/"+subreddit+"/comments/" + data['data']['children'][index]['data']['id'].replace(/['"]+/g, '');
            //get the image url
            var post_image_url = data['data']['children'][index]['data']['url'].replace(/['"]+/g, '');
            //get the poster's username
            var post_username = data['data']['children'][index]['data']['author'].replace(/['"]+/g, '');
            //get the post's title
            var post_title = data['data']['children'][index]['data']['title'].replace(/['"]+/g, '');

            //Post the meme
<<<<<<< HEAD
            var channel_list = [/*Replace with known channel ID dndmemes*/];
=======
            var channel_list = ['', '']; // Replace with known channel ID 
>>>>>>> f3d445955b8e0d5b34687e695da5151879fa9fdb
            for (let channel of channel_list) {
                var generalChannel = client.channels.get(channel) 
                try {
                    // Set the title of the field
                    embed.setTitle('Top post on r/' + subreddit + ' from the past 24 hours')
                    // Set the URL for the embed
                    embed.setURL(post_url)
                    // Set the color of the embed
                    embed.setColor(0xFF0000)
                    // Set the main content of the embed
                    embed.setDescription(post_title);
                    // Set the image of the embed
                    embed.setImage(post_image_url)
                    // Send the embed to the same channel as the message
                    generalChannel.send(embed);
                    console.log('Posted a meme from r/' + subreddit)
                } catch(e) {
                    console.log('Error posting the meme:', e.stack);
                }
            }
          });
    }
};
