const schedule = require("node-schedule");
const { getSettings, setSettings, getDatabase } = require("./db/dal.js");

function startScheduler(client) {
  schedule.scheduleJob("* * * * *", async () => {
    try {
      const db = getDatabase();
      const allSettings = db.prepare("SELECT * FROM guild_settings").all();

      for (const settings of allSettings) {
        const guildId = settings.guild_id;
        const config = getSettings(guildId);

        if (
          !config ||
          !config.nextSession ||
          !config.announcementChannel ||
          !config.announcementRole
        ) {
          continue;
        }

        const now = new Date();
        const sessionTime = new Date(config.nextSession * 1000);
        const fiveMinutesBefore = new Date(sessionTime.getTime() - 5 * 60 * 1000);

        // Reset sent flags if a new session is set
        if (config.nextSession && (!config.dayOfMessageSent || !config.fiveMinuteWarningSent)) {
          setSettings(guildId, {
            nextSession: config.nextSession,
            announcementChannel: config.announcementChannel,
            announcementRole: config.announcementRole,
            dayOfMessageSent: false,
            fiveMinuteWarningSent: false,
          });
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
          try {
            const channel = await client.channels.fetch(config.announcementChannel);
            if (channel) {
              const message = await channel.send(
                `<@&${config.announcementRole}> Today is the day! Are you available for the session at <t:${config.nextSession}:t>?`,
              );
              await message.react("👍");
              await message.react("👎");

              setSettings(guildId, {
                nextSession: config.nextSession,
                announcementChannel: config.announcementChannel,
                announcementRole: config.announcementRole,
                dayOfMessageSent: true,
                fiveMinuteWarningSent: config.fiveMinuteWarningSent,
              });
            }
          } catch (error) {
            console.error(`Error sending day-of message for guild ${guildId}:`, error.message);
          }
        }

        // 5-minute warning
        if (
          now.getTime() >= fiveMinutesBefore.getTime() &&
          now.getTime() < sessionTime.getTime() &&
          !config.fiveMinuteWarningSent
        ) {
          try {
            const channel = await client.channels.fetch(config.announcementChannel);
            if (channel) {
              await channel.send(
                `<@&${config.announcementRole}> The session is starting in 5 minutes!`,
              );
              setSettings(guildId, {
                nextSession: config.nextSession,
                announcementChannel: config.announcementChannel,
                announcementRole: config.announcementRole,
                dayOfMessageSent: config.dayOfMessageSent,
                fiveMinuteWarningSent: true,
              });
            }
          } catch (error) {
            console.error(`Error sending 5-minute warning for guild ${guildId}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error("Error in scheduler:", error.message);
    }
  });
}

module.exports = {
  startScheduler,
};
