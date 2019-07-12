
module.exports = {
    post_scheduled_meme : function(client, embed, subreddit){
        var request = require('request');
        var fs = require('fs');
        const path = require('path');

        request({
            headers: {
                'User-Agent' : 'personal:Gary:vSoult (by /u/broseidon16)'
            },
            uri: 'https://www.reddit.com/r/' + subreddit + '/top/.json?sort=top&t=day&limit=10',
            method: 'GET'
          }, function (err, res, body) {
            var data = JSON.parse(body); 
            var index = 0;
              while (data['data']['children'][index]['data']['is_self'] != false && data['data']['children'][index]['data']['over_18'] != false && index < 10){ //this loops through to find the first non-text post
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

            // Save the meme
            fs.appendFileSync(path.resolve(__dirname,"memeData", subreddit + ".txt"), "\n" + post_image_url);

            //Post the meme
            var channel_list = [/*Replace with known channel ID dndmemes*/"496100600644239380"];
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
                    embed.setImage(post_image_url);
                    // Send the embed to the same channel as the message
                    generalChannel.send(embed);
                    console.log('Posted a meme from r/' + subreddit);
                } catch(e) {
                    console.log('Error posting the meme:', e.stack);
                }
            }
          });
    },

    post_random_meme : function(channel, embed) {
        try {
            //this function will be used to post a random meme from the database
            var fs = require('fs');
            const path = require('path');
            
            //files can be found in the directory 'memeData'
            var files = ['Animemes.txt', 'DnDMemes.txt', 'Memes.txt', 'TrippinThroughTime.txt', 'DankMemes.txt', 'LotRMemes.txt', 'PrequelMemes.txt'];
            var file_selection = files[Math.floor(Math.random() * files.length)];
            
            var memes = fs.readFileSync(path.resolve(__dirname,"memeData",file_selection)).toString().split("\n");
            var meme = "";
            while(meme == ""){
                meme = memes[Math.floor(Math.random() * memes.length)];
            }
            
            //format the post
            embed.setTitle('Random meme from ' + file_selection.slice(0,-4));
            embed.setColor(0xFF0000);
            embed.setImage(meme);
            channel.send(embed);
            console.log("Posted a random meme, " + meme+ ", from " + file_selection);
        } catch(e) {
            console.log("Error posting the random meme:", e.stack);
        }
    }
};
