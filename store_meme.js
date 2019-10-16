module.exports = {
    store_memes : function(subreddits) {
        var request = require('request');
        var fs = require('fs');
        const path = require('path');

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
              });
              console.log('Stored Memes');
        });       
    },

    delete_duplicates : function() {
        //This function will look to see if there are any duplicate memes within the meme database and remove one of them
        var fs = require('fs');
        const path = require('path');
        console.log(path.resolve(__dirname, "memeData"));
        //Get the files in the meme directory
        //var files;
        fs.readdir(path.resolve(__dirname, "memeData"), function(err, items) {
            //For each of the files in the database
            for (var i = 0; i < items.length; i++) {
                // go through the file and find duplicates
                var buf=fs.readFileSync(path.resolve(__dirname, "memeData", items[i]));
                var links = new Set()
                buf.toString().split(/\n/).forEach(function(line){
                    links.add(line)
                });

                let writeStream = fs.createWriteStream(path.resolve(__dirname, "memeData", items[i]))

                links.forEach(link => {
                    writeStream.write(link + '\n')
                });
                writeStream.end()
            console.log("Removed duplicate URLs from the meme files")
            }
        });
    }
}