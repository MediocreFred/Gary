module.exports = {
    store_memes : function(subreddits) {
        var request = require('request');
        var fs = require('fs');
        const path = require('path');

        console.log('Made it here');

        subreddits.forEach(subreddit => {
            request({
                headers: {
                    'User-Agent' : 'personal:Gary:v1.1Davout (by /u/broseidon16)'
                },
                uri: 'https://www.reddit.com/r/' + subreddit + '/top/.json?sort=top&t=day&limit=10',
                method: 'GET'
              }, function (err, res, body) {
                var data = JSON.parse(body); 
                var index = 0;
                  while (data['data']['children'][index]['data']['is_self'] != false && data['data']['children'][index]['data']['over_18'] != false && index < 10){ //this loops through to find the first non-text post
                    index = index+1;
                }
                //get the image url
                var post_image_url = data['data']['children'][index]['data']['url'].replace(/['"]+/g, '');
                // Save the meme
                fs.appendFileSync(path.resolve(__dirname,"memeData", subreddit + ".txt"), "\n" + post_image_url);
                console.log('Stored');
              });
        });
        
    }
}