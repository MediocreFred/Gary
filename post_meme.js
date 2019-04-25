
module.exports = {
    post_meme : function(client, embed){
        var fs = require('fs');
        try {
            // Get the post id (for posting full url
            try {
                var post_url = fs.readFileSync('post_url.txt', 'utf8');
                console.log(post_url);
            } catch(e) {
                console.log('Error getting post URL:', e.stack);
            }
            //get the picture url
            try {
                var post_image_url = fs.readFileSync('post_image_url.txt', 'utf8');
                console.log(post_image_url);
            } catch(e) {
                console.log('Error getting post image URL:', e.stack);
            }
            // get the username of the OP
            try {
                var post_username = fs.readFileSync('post_username.txt', 'utf8');
                console.log(post_username);
            } catch(e) {
                console.log('Error getting post username:', e.stack);
            }
            //get the title of the post
            try {
                var post_title = fs.readFileSync('post_title.txt', 'utf8');
                console.log(post_title);
            } catch(e) {
                console.log('Error getting post title:', e.stack);
            }
            //Post the meme
            var channel_list = ['', '']; // Replace with known channel ID 
            for (let channel of channel_list) {
                var generalChannel = client.channels.get(channel) 
                try {
                    // Set the title of the field
                    embed.setTitle('Top post on r/DnDMemes from the past 24 hours')
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
                    //generalChannel.send("**Top post on r/DnDMemes from the past 24 hours\nAuthor: **" + post_username + "**\nTitle: **" + post_title + "\n" + post_image_url + '\n' + '<' + post_url + '>')
                } catch(e) {
                    console.log('Error posting the meme:', e.stack);
                }
            }
        } catch(e) {
            console.log('Error posting the meme:', e.stack);
        }
    }
};
