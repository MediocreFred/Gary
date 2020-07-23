module.exports = {
    name: 'meme',
    description: 'Posts a random meme',
    execute(message, args) {
        message.channel.send('Meme!');
    },
    /* execute(channel, embed) {
        try {
            // this function will be used to post a random meme from the database
            const fs = require('fs');
            const path = require('path');

            // files can be found in the directory 'memeData'
            const files = ['Animemes.txt', 'DnDMemes.txt', 'Memes.txt', 'TrippinThroughTime.txt', 'DankMemes.txt', 'LotRMemes.txt', 'PrequelMemes.txt'];
            const file_selection = files[Math.floor(Math.random() * files.length)];
            const memes = fs.readFileSync(path.resolve(__dirname, '../memeData', file_selection)).toString().split('\n');
            let meme = '';
            while(meme == '') {
                meme = memes[Math.floor(Math.random() * memes.length)];
            }

            // format the post
            embed.setTitle('Random meme from ' + file_selection.slice(0, -4));
            embed.setColor(0xFF0000);
            embed.setImage(meme);
            channel.send(embed);
            console.log('Posted a random meme, ' + meme + ', from ' + file_selection);
        }
        catch(e) {
            console.log('Error posting the random meme:', e.stack);
        }
    }, */
};
