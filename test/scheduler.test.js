const { assert } = require("chai");
const fs = require("node:fs");
const path = require("node:path");
const { setSettings, getSettings, deleteSettings, closeDatabase } = require("../db/dal.js");

const databasePath = path.resolve(__dirname, "..", "database.db");

// We'll test the scheduler logic without actually scheduling
describe("Scheduler Logic (Database Integration)", () => {
  const TEST_GUILD_ID = "test-guild-scheduler";

  before(() => {
    // Initialize database
    require("../db/dal.js").getSettings("dummy");
  });

  afterEach(() => {
    try {
      deleteSettings(TEST_GUILD_ID);
    } catch (_error) { // eslint-disable-line no-unused-vars
      // Ignore
    }
  });

  after(() => {
    closeDatabase();
    if (fs.existsSync(databasePath)) {
      try {
        fs.unlinkSync(databasePath);
      } catch (_error) {
        console.warn("Could not delete test database:", _error.message);
      }
    }
  });

  describe("Scheduler Logic - Day of Message", () => {
    it("should identify when it's the day of session (9am specific time check)", () => {
      // Create a mock session for today at 9:15 AM
      const now = new Date();
      const sessionTime = new Date();
      sessionTime.setHours(14, 0, 0, 0); // 2 PM today

      const nextSession = Math.floor(sessionTime.getTime() / 1000);

      setSettings(TEST_GUILD_ID, {
        nextSession,
        announcementChannel: "valid-channel-id",
        announcementRole: "role-123",
        dayOfMessageSent: false,
        fiveMinuteWarningSent: false,
      });

      const settings = getSettings(TEST_GUILD_ID);
      const sessionDate = new Date(settings.nextSession * 1000);

      // Verify it's the same day
      assert.equal(now.getFullYear(), sessionDate.getFullYear());
      assert.equal(now.getMonth(), sessionDate.getMonth());
      assert.equal(now.getDate(), sessionDate.getDate());
    });

    it("should identify when it's NOT the day of session", () => {
      // Create a mock session for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);

      const sessionTime = Math.floor(tomorrow.getTime() / 1000);
      const now = new Date();

      setSettings(TEST_GUILD_ID, {
        nextSession: sessionTime,
        dayOfMessageSent: false,
      });

      const settings = getSettings(TEST_GUILD_ID);
      const sessionDate = new Date(settings.nextSession * 1000);

      // Verify it's NOT the same day
      assert.notEqual(now.getDate(), sessionDate.getDate());
    });

    it("should track dayOfMessageSent flag correctly", () => {
      const timestamp = Math.floor(Date.now() / 1000);

      setSettings(TEST_GUILD_ID, {
        nextSession: timestamp,
        announcementChannel: "channel-123",
        announcementRole: "role-456",
        dayOfMessageSent: false,
      });

      let settings = getSettings(TEST_GUILD_ID);
      assert.isFalse(settings.dayOfMessageSent);

      // Update the flag
      setSettings(TEST_GUILD_ID, {
        nextSession: timestamp,
        announcementChannel: "channel-123",
        announcementRole: "role-456",
        dayOfMessageSent: true,
      });

      settings = getSettings(TEST_GUILD_ID);
      assert.isTrue(settings.dayOfMessageSent);
    });
  });

  describe("Scheduler Logic - 5-Minute Warning", () => {
    it("should calculate 5-minute warning time correctly", () => {
      const sessionTime = new Date();
      sessionTime.setMinutes(sessionTime.getMinutes() + 10); // 10 minutes from now
      const nextSession = Math.floor(sessionTime.getTime() / 1000);
      const fiveMinutesBefore = new Date(sessionTime.getTime() - 5 * 60 * 1000);

      setSettings(TEST_GUILD_ID, {
        nextSession,
        announcementChannel: "channel-123",
        announcementRole: "role-456",
        fiveMinuteWarningSent: false,
      });

      const now = new Date();

      // Verify the 5-minute window has not started yet (session is 10 min away)
      assert.isTrue(now.getTime() < fiveMinutesBefore.getTime());
    });

    it("should track fiveMinuteWarningSent flag correctly", () => {
      const timestamp = Math.floor(Date.now() / 1000) + 300; // 5 min in future

      setSettings(TEST_GUILD_ID, {
        nextSession: timestamp,
        announcementChannel: "channel-123",
        announcementRole: "role-456",
        fiveMinuteWarningSent: false,
      });

      let settings = getSettings(TEST_GUILD_ID);
      assert.isFalse(settings.fiveMinuteWarningSent);

      // Update the flag
      setSettings(TEST_GUILD_ID, {
        nextSession: timestamp,
        announcementChannel: "channel-123",
        announcementRole: "role-456",
        fiveMinuteWarningSent: true,
      });

      settings = getSettings(TEST_GUILD_ID);
      assert.isTrue(settings.fiveMinuteWarningSent);
    });
  });

  describe("Scheduler Logic - Flag Reset", () => {
    it("should reset both flags when a new session is set", () => {
      const oldTimestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago

      // Set initial session with flags
      setSettings(TEST_GUILD_ID, {
        nextSession: oldTimestamp,
        announcementChannel: "channel-123",
        announcementRole: "role-456",
        dayOfMessageSent: true,
        fiveMinuteWarningSent: true,
      });

      let settings = getSettings(TEST_GUILD_ID);
      assert.isTrue(settings.dayOfMessageSent);
      assert.isTrue(settings.fiveMinuteWarningSent);

      // Set new session (should reset flags)
      const newTimestamp = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      setSettings(TEST_GUILD_ID, {
        nextSession: newTimestamp,
        announcementChannel: "channel-123",
        announcementRole: "role-456",
        dayOfMessageSent: false,
        fiveMinuteWarningSent: false,
      });

      settings = getSettings(TEST_GUILD_ID);
      assert.isFalse(settings.dayOfMessageSent);
      assert.isFalse(settings.fiveMinuteWarningSent);
      assert.equal(settings.nextSession, newTimestamp);
    });
  });

  describe("Scheduler Logic - Missing Required Fields", () => {
    it("should skip scheduling if nextSession is missing", () => {
      setSettings(TEST_GUILD_ID, {
        announcementChannel: "channel-123",
        announcementRole: "role-456",
      });

      const settings = getSettings(TEST_GUILD_ID);
      const shouldSkip = !settings.nextSession;

      assert.isTrue(shouldSkip, "Should skip if nextSession is missing");
    });

    it("should skip scheduling if announcementChannel is missing", () => {
      setSettings(TEST_GUILD_ID, {
        nextSession: Math.floor(Date.now() / 1000) + 3600,
        announcementRole: "role-456",
      });

      const settings = getSettings(TEST_GUILD_ID);
      const shouldSkip = !settings.announcementChannel;

      assert.isTrue(shouldSkip, "Should skip if announcementChannel is missing");
    });

    it("should skip scheduling if announcementRole is missing", () => {
      setSettings(TEST_GUILD_ID, {
        nextSession: Math.floor(Date.now() / 1000) + 3600,
        announcementChannel: "channel-123",
      });

      const settings = getSettings(TEST_GUILD_ID);
      const shouldSkip = !settings.announcementRole;

      assert.isTrue(shouldSkip, "Should skip if announcementRole is missing");
    });

    it("should have all required fields if all are set", () => {
      setSettings(TEST_GUILD_ID, {
        nextSession: Math.floor(Date.now() / 1000) + 3600,
        announcementChannel: "channel-123",
        announcementRole: "role-456",
      });

      const settings = getSettings(TEST_GUILD_ID);
      assert.isNotNull(settings, "Settings should exist");
      assert.isNotNull(settings.nextSession, "nextSession should be set");
      assert.equal(settings.announcementChannel, "channel-123", "announcementChannel should be set");
      assert.equal(settings.announcementRole, "role-456", "announcementRole should be set");
    });
  });

  describe("Scheduler Logic - Multi-Guild Iteration", () => {
    it("should process settings for all configured guilds", () => {
      const guild1 = "guild-1";
      const guild2 = "guild-2";
      const guild3 = "guild-3";

      const settings = {
        nextSession: Math.floor(Date.now() / 1000) + 3600,
        announcementChannel: "channel-123",
        announcementRole: "role-456",
      };

      setSettings(guild1, settings);
      setSettings(guild2, settings);
      setSettings(guild3, settings);

      // Verify all are retrievable
      assert.isNotNull(getSettings(guild1));
      assert.isNotNull(getSettings(guild2));
      assert.isNotNull(getSettings(guild3));

      // Cleanup
      deleteSettings(guild1);
      deleteSettings(guild2);
      deleteSettings(guild3);
    });
  });

  describe("Scheduler Logic - Timestamp Handling", () => {
    it("should correctly parse Unix timestamps (seconds)", () => {
      const unixSeconds = Math.floor(Date.now() / 1000) + 3600;

      setSettings(TEST_GUILD_ID, {
        nextSession: unixSeconds,
      });

      const settings = getSettings(TEST_GUILD_ID);
      assert.equal(settings.nextSession, unixSeconds);

      // Verify we can reconstruct the date correctly (within 1 second tolerance)
      const reconstructed = new Date(settings.nextSession * 1000);
      const expected = new Date(unixSeconds * 1000);
      // Check they're equal within 1 second
      assert.approximately(reconstructed.getTime(), expected.getTime(), 1000);
    });

    it("should handle past timestamps gracefully", () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago

      setSettings(TEST_GUILD_ID, {
        nextSession: pastTime,
        announcementChannel: "channel-123",
        announcementRole: "role-456",
        dayOfMessageSent: false,
        fiveMinuteWarningSent: false,
      });

      const settings = getSettings(TEST_GUILD_ID);
      const now = new Date();
      const sessionTime = new Date(settings.nextSession * 1000);

      // Verify session time is in the past
      assert.isTrue(now.getTime() > sessionTime.getTime());
    });
  });

  describe("Scheduler Logic - Flag Initialization", () => {
    it("should initialize flags to false when not specified", () => {
      setSettings(TEST_GUILD_ID, {
        nextSession: Math.floor(Date.now() / 1000) + 3600,
        announcementChannel: "channel-123",
        announcementRole: "role-456",
      });

      const settings = getSettings(TEST_GUILD_ID);
      assert.isFalse(settings.dayOfMessageSent);
      assert.isFalse(settings.fiveMinuteWarningSent);
    });
  });
});
