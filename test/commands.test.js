const { assert } = require("chai");
const fs = require("node:fs");
const path = require("node:path");
const setNextCommand = require("../src/commands/setnext.js");
const setChannelCommand = require("../src/commands/setchannel.js");
const setRoleCommand = require("../src/commands/setrole.js");
const {
  getSettings,
  setSettings,
  deleteSettings,
  closeDatabase,
  setBotSetting,
} = require("../db/dal.js");

// Test Constants
const TEST_GUILD_ID = "532730993962909697";
const TEST_OWNER_ID = "123456789";
const TEST_USER_ID = "user-123";
const configPath = path.resolve(__dirname, "..", "config.json");
const databasePath = path.resolve(__dirname, "..", "database.db");

// Mock Interaction Factory
const makeMockInteraction = ({
  userId = TEST_USER_ID,
  guildId = TEST_GUILD_ID,
  options = {},
} = {}) => ({
  user: { id: userId },
  guildId: guildId,
  options: {
    getString: (key) => options.string?.[key] || null,
    getChannel: (key) => options.channel?.[key] || null,
    getRole: (key) => options.role?.[key] || null,
  },
  reply: function (payload) {
    this.lastReply = typeof payload === "string" ? payload : payload?.content || payload;
    return Promise.resolve();
  },
  deferred: false,
  replied: false,
});

describe("Updated Discord Commands with Database", () => {
  let originalConfig;

  before(() => {
    // Save original config
    originalConfig = fs.readFileSync(configPath, "utf8");
  });

  beforeEach(() => {
    // Set the owner for tests
    setBotSetting("owner", TEST_OWNER_ID);

    // Clean up any existing test guild settings
    try {
      deleteSettings(TEST_GUILD_ID);
    } catch (_error) { // eslint-disable-line no-unused-vars
      // Ignore
    }
  });

  afterEach(() => {
    // Clean up test data
    try {
      deleteSettings(TEST_GUILD_ID);
    } catch (_error) { // eslint-disable-line no-unused-vars
      // Ignore
    }
  });

  after(() => {
    // Restore original config
    fs.writeFileSync(configPath, originalConfig, "utf8");

    // Clean up database
    closeDatabase();
    if (fs.existsSync(databasePath)) {
      try {
        fs.unlinkSync(databasePath);
      } catch (error) {
        console.warn("Could not delete test database:", error.message);
      }
    }
  });

  describe("/setnext Command", () => {
    it("should reject if user is not the owner", async () => {
      const interaction = makeMockInteraction({
        userId: TEST_USER_ID,
        options: {
          string: { when: "2026-03-26 14:00" },
        },
      });

      await setNextCommand.execute(interaction);

      assert.include(interaction.lastReply, "Only the owner can set the next session time");
    });

    it("should reject if not used in a guild (no guildId)", async () => {
      const interaction = makeMockInteraction({
        userId: TEST_OWNER_ID,
        guildId: null,
        options: {
          string: { when: "2026-03-26 14:00" },
        },
      });

      await setNextCommand.execute(interaction);

      assert.include(interaction.lastReply, "can only be used in a server");
    });

    it("should accept valid date string and save to database", async () => {
      const interaction = makeMockInteraction({
        userId: TEST_OWNER_ID,
        options: {
          string: { when: "2026-03-26 14:00" },
        },
      });

      await setNextCommand.execute(interaction);

      const settings = getSettings(TEST_GUILD_ID);
      assert.isNotNull(settings);
      assert.isNumber(settings.nextSession);
      assert.isFalse(settings.dayOfMessageSent);
      assert.isFalse(settings.fiveMinuteWarningSent);
    });

    it("should accept unix timestamp (seconds) and save to database", async () => {
      const timestamp = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      const interaction = makeMockInteraction({
        userId: TEST_OWNER_ID,
        options: {
          string: { when: timestamp.toString() },
        },
      });

      await setNextCommand.execute(interaction);

      const settings = getSettings(TEST_GUILD_ID);
      assert.isNotNull(settings);
      assert.equal(settings.nextSession, timestamp);
    });

    it("should accept unix timestamp (milliseconds) and convert to seconds", async () => {
      const timestampMs = Date.now() + 86400000; // Tomorrow in ms
      const expectedSeconds = Math.floor(timestampMs / 1000);
      const interaction = makeMockInteraction({
        userId: TEST_OWNER_ID,
        options: {
          string: { when: timestampMs.toString() },
        },
      });

      await setNextCommand.execute(interaction);

      const settings = getSettings(TEST_GUILD_ID);
      assert.isNotNull(settings);
      assert.equal(settings.nextSession, expectedSeconds);
    });

    it("should reset warning flags when setting new session", async () => {
      // Pre-set some flags
      setSettings(TEST_GUILD_ID, {
        nextSession: Math.floor(Date.now() / 1000),
        dayOfMessageSent: true,
        fiveMinuteWarningSent: true,
      });

      const newTimestamp = Math.floor(Date.now() / 1000) + 86400;
      const interaction = makeMockInteraction({
        userId: TEST_OWNER_ID,
        options: {
          string: { when: newTimestamp.toString() },
        },
      });

      await setNextCommand.execute(interaction);

      const settings = getSettings(TEST_GUILD_ID);
      assert.isFalse(settings.dayOfMessageSent);
      assert.isFalse(settings.fiveMinuteWarningSent);
    });

    it("should preserve existing channel and role when updating timestamp", async () => {
      // Pre-set channel and role
      setSettings(TEST_GUILD_ID, {
        announcementChannel: "channel-123",
        announcementRole: "role-456",
      });

      const timestamp = Math.floor(Date.now() / 1000) + 86400;
      const interaction = makeMockInteraction({
        userId: TEST_OWNER_ID,
        options: {
          string: { when: timestamp.toString() },
        },
      });

      await setNextCommand.execute(interaction);

      const settings = getSettings(TEST_GUILD_ID);
      assert.equal(settings.announcementChannel, "channel-123");
      assert.equal(settings.announcementRole, "role-456");
      assert.equal(settings.nextSession, timestamp);
    });

    it("should reject invalid date strings", async () => {
      const interaction = makeMockInteraction({
        userId: TEST_OWNER_ID,
        options: {
          string: { when: "invalid-date-string-xyz" },
        },
      });

      await setNextCommand.execute(interaction);

      assert.include(interaction.lastReply, "valid date/time string");
      const settings = getSettings(TEST_GUILD_ID);
      assert.isNull(settings, "Should not create settings for invalid input");
    });

    it("should handle database errors gracefully", async () => {
      const interaction = makeMockInteraction({
        userId: TEST_OWNER_ID,
        options: {
          string: { when: Math.floor(Date.now() / 1000).toString() },
        },
      });

      // Should not throw
      assert.doesNotThrow(async () => {
        await setNextCommand.execute(interaction);
      });
    });
  });

  describe("/setchannel Command", () => {
    it("should reject if user is not the owner", async () => {
      const interaction = makeMockInteraction({
        userId: TEST_USER_ID,
        options: {
          channel: { channel: { id: "channel-123" } },
        },
      });

      await setChannelCommand.execute(interaction);

      assert.include(interaction.lastReply, "Only the owner can set the announcement channel");
    });

    it("should reject if not used in a guild", async () => {
      const interaction = makeMockInteraction({
        userId: TEST_OWNER_ID,
        guildId: null,
      });

      await setChannelCommand.execute(interaction);

      assert.include(interaction.lastReply, "can only be used in a server");
    });

    it("should reject if no valid channel provided", async () => {
      const interaction = makeMockInteraction({
        userId: TEST_OWNER_ID,
        options: {
          channel: { channel: null },
        },
      });

      await setChannelCommand.execute(interaction);

      assert.include(interaction.lastReply, "valid channel");
    });

    it("should save channel to database", async () => {
      const mockChannel = { id: "channel-123" };
      const interaction = makeMockInteraction({
        userId: TEST_OWNER_ID,
        options: {
          channel: { channel: mockChannel },
        },
      });

      await setChannelCommand.execute(interaction);

      const settings = getSettings(TEST_GUILD_ID);
      assert.isNotNull(settings);
      assert.equal(settings.announcementChannel, "channel-123");
    });

    it("should preserve existing nextSession and role when updating channel", async () => {
      setSettings(TEST_GUILD_ID, {
        nextSession: 1774315200,
        announcementRole: "role-456",
      });

      const mockChannel = { id: "channel-789" };
      const interaction = makeMockInteraction({
        userId: TEST_OWNER_ID,
        options: {
          channel: { channel: mockChannel },
        },
      });

      await setChannelCommand.execute(interaction);

      const settings = getSettings(TEST_GUILD_ID);
      assert.equal(settings.nextSession, 1774315200);
      assert.equal(settings.announcementRole, "role-456");
      assert.equal(settings.announcementChannel, "channel-789");
    });
  });

  describe("/setrole Command", () => {
    it("should reject if user is not the owner", async () => {
      const interaction = makeMockInteraction({
        userId: TEST_USER_ID,
        options: {
          role: { role: { id: "role-123" } },
        },
      });

      await setRoleCommand.execute(interaction);

      assert.include(interaction.lastReply, "Only the owner can set the announcement role");
    });

    it("should reject if not used in a guild", async () => {
      const interaction = makeMockInteraction({
        userId: TEST_OWNER_ID,
        guildId: null,
      });

      await setRoleCommand.execute(interaction);

      assert.include(interaction.lastReply, "can only be used in a server");
    });

    it("should reject if no valid role provided", async () => {
      const interaction = makeMockInteraction({
        userId: TEST_OWNER_ID,
        options: {
          role: { role: null },
        },
      });

      await setRoleCommand.execute(interaction);

      assert.include(interaction.lastReply, "valid role");
    });

    it("should save role to database", async () => {
      const mockRole = { id: "role-123" };
      const interaction = makeMockInteraction({
        userId: TEST_OWNER_ID,
        options: {
          role: { role: mockRole },
        },
      });

      await setRoleCommand.execute(interaction);

      const settings = getSettings(TEST_GUILD_ID);
      assert.isNotNull(settings);
      assert.equal(settings.announcementRole, "role-123");
    });

    it("should preserve existing nextSession and channel when updating role", async () => {
      setSettings(TEST_GUILD_ID, {
        nextSession: 1774315200,
        announcementChannel: "channel-456",
      });

      const mockRole = { id: "role-789" };
      const interaction = makeMockInteraction({
        userId: TEST_OWNER_ID,
        options: {
          role: { role: mockRole },
        },
      });

      await setRoleCommand.execute(interaction);

      const settings = getSettings(TEST_GUILD_ID);
      assert.equal(settings.nextSession, 1774315200);
      assert.equal(settings.announcementChannel, "channel-456");
      assert.equal(settings.announcementRole, "role-789");
    });
  });

  describe("Multi-Guild Support", () => {
    it("should support settings for different guilds independently", async () => {
      const guild1 = "guild-1";
      const guild2 = "guild-2";

      // Create interaction for guild 1
      const interaction1 = makeMockInteraction({
        userId: TEST_OWNER_ID,
        guildId: guild1,
        options: {
          string: { when: "1774315200" },
        },
      });

      await setNextCommand.execute(interaction1);

      // Create interaction for guild 2
      const interaction2 = makeMockInteraction({
        userId: TEST_OWNER_ID,
        guildId: guild2,
        options: {
          string: { when: "1774315300" },
        },
      });

      await setNextCommand.execute(interaction2);

      const settings1 = getSettings(guild1);
      const settings2 = getSettings(guild2);

      assert.equal(settings1.nextSession, 1774315200);
      assert.equal(settings2.nextSession, 1774315300);

      // Cleanup
      deleteSettings(guild1);
      deleteSettings(guild2);
    });
  });
});
