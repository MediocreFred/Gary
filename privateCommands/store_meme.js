require('log-timestamp');

module.exports = {
    name: 'store memes',
    description: 'Store memes the top memes from the day for the selected subreddits',
    execute(subreddits) {
        const request = require('request');
        const fs = require('fs');
        const path = require('path');

        subreddits.forEach(subreddit => {
            request({
                headers: {
                    'User-Agent': 'personal:Gary:v2.0 (by /u/broseidon16)',
                },
                uri: 'https://www.reddit.com/r/' + subreddit + '/top/.json?sort=top&t=day&limit=10',
                method: 'GET',
            }, function(err, res, body) {
                const data = JSON.parse(body);
                let index = 0;
                // this loops through to find the first non-text post
                while (data.data.children[index].data.is_self !== false && data.data.children[index].data.over_18 !== false && index < 10) {
                    index = index + 1;
                }
                // get the image url
                const postImageUrl = data.data.children[index].data.url.replace(/['"]+/g, '');
                // Save the meme
                fs.appendFileSync(path.resolve(__dirname, '../memeData', subreddit + '.txt'), '\n' + postImageUrl);
                if (err) throw err;
                console.log(data);
            });
            console.log('Stored Memes');
        });
    },

    delete_duplicates: function() {
    // This function will look to see if there are any duplicate memes within the meme database and remove one of them
        const fs = require('fs');
        const path = require('path');
        console.log(path.resolve(__dirname + '/../memeData'));
        // Get the files in the meme directory
        // var files;
        fs.readdir(path.resolve(__dirname + '/../memeData'), function(err, items) {
            // For each of the files in the database
            for (let i = 0; i < items.length; i++) {
                // go through the file and find duplicates
                const buf = fs.readFileSync(path.resolve(__dirname + '/../memeData', items[i]));
                const links = new Set();
                buf.toString().split(/\n/).forEach(function(line) {
                    links.add(line);
                });

                const writeStream = fs.createWriteStream(path.resolve(__dirname + '/../memeData', items[i]));

                links.forEach(link => {
                    writeStream.write(link + '\n');
                });
                writeStream.end();
                console.log('Removed duplicate URLs from the meme files');
            }
            if (err) throw err;
        });
    },
};
