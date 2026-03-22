const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  name: 'next',
  description: 'Displays the time of the next session.',
  execute(message, args) {
    const configPath = path.resolve(__dirname, '..', 'config.json');

    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.error('Error reading config:', error);
      return message.channel.send('There was an error retrieving the schedule.');
    }

    const timestamp = config.nextSession;

    if (timestamp) {
      message.channel.send(`The next session is scheduled for <t:${timestamp}:R>`);
    } else {
      message.channel.send('The next session has not been set yet. Use the `!setnext` command to set it.');
    }
  },
};
