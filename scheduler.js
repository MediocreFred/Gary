const schedule = require('node-schedule');
const fs = require('node:fs');
const path = require('node:path');
const { EmbedBuilder } = require('discord.js');

function startScheduler(client) {
    schedule.scheduleJob('* * * * *', async () => {
        const configPath = path.resolve(__dirname, 'config.json');
        const config = require(configPath);

        if (!config.nextSession || !config.announcementChannel || !config.announcementRole) {
            return;
        }

        const now = new Date();
        const sessionTime = new Date(config.nextSession * 1000);
        const fiveMinutesBefore = new Date(sessionTime.getTime() - 5 * 60 * 1000);

        // Reset sent flags if a new session is set
        if (config.nextSession && (config.dayOfMessageSent === undefined || config.fiveMinuteWarningSent === undefined)) {
            config.dayOfMessageSent = false;
            config.fiveMinuteWarningSent = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        }

        // Day of message (9am on the day of the session)
        if (
            now.getFullYear() === sessionTime.getFullYear() &&
            now.getMonth() === sessionTime.getMonth() &&
            now.getDate() === sessionTime.getDate() &&
            now.getHours() === 9 &&
            now.getMinutes() === 0 &&
            !config.dayOfMessageSent
        ) {
            const channel = await client.channels.fetch(config.announcementChannel);
            if (channel) {
                const message = await channel.send(`<@&${config.announcementRole}> Today is the day! Are you available for the session at <t:${config.nextSession}:t>?`);
                await message.react('👍');
                await message.react('👎');

                config.dayOfMessageSent = true;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            }
        }

        // 5-minute warning
        if (
            now.getTime() >= fiveMinutesBefore.getTime() &&
            now.getTime() < sessionTime.getTime() &&
            !config.fiveMinuteWarningSent
        ) {
            const channel = await client.channels.fetch(config.announcementChannel);
            if (channel) {
                await channel.send(`<@&${config.announcementRole}> The session is starting in 5 minutes!`);
                config.fiveMinuteWarningSent = true;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            }
        }
    });
}

module.exports = {
    startScheduler,
};
