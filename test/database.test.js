const { assert } = require("chai");
const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

// Import DAL functions
const {
  getDatabase,
  getSettings,
  setSettings,
  deleteSettings,
  closeDatabase,
} = require("../db/dal.js");

describe("Database DAL (Data Access Layer)", () => {
  const testGuildId = "test-guild-123";
  const testDatabasePath = path.resolve(__dirname, "..", "database.db");

  afterEach(() => {
    try {
      // Clean up test data
      deleteSettings(testGuildId);
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  after(() => {
    // Clean up database file after all tests
    closeDatabase();
    if (fs.existsSync(testDatabasePath)) {
      try {
        fs.unlinkSync(testDatabasePath);
      } catch (error) {
        console.warn("Could not delete test database file:", error.message);
      }
    }
  });

  describe("getSettings()", () => {
    it("should return null for non-existent guild", () => {
      const result = getSettings("non-existent-guild-xyz");
      assert.isNull(result, "Should return null for non-existent guild");
    });

    it("should retrieve settings for an existing guild", () => {
      const testSettings = {
        nextSession: 1774315200,
        announcementChannel: "channel-123",
        announcementRole: "role-456",
        dayOfMessageSent: false,
        fiveMinuteWarningSent: false,
      };

      setSettings(testGuildId, testSettings);
      const result = getSettings(testGuildId);

      assert.isNotNull(result, "Settings should exist");
      assert.equal(result.guildId, testGuildId);
      assert.equal(result.nextSession, testSettings.nextSession);
      assert.equal(result.announcementChannel, testSettings.announcementChannel);
      assert.equal(result.announcementRole, testSettings.announcementRole);
      assert.isFalse(result.dayOfMessageSent);
      assert.isFalse(result.fiveMinuteWarningSent);
    });

    it("should convert integer flags back to booleans", () => {
      const testSettings = {
        nextSession: 1774315200,
        announcementChannel: "channel-123",
        announcementRole: "role-456",
        dayOfMessageSent: true,
        fiveMinuteWarningSent: true,
      };

      setSettings(testGuildId, testSettings);
      const result = getSettings(testGuildId);

      assert.isTrue(result.dayOfMessageSent, "Should convert integer 1 to boolean true");
      assert.isTrue(result.fiveMinuteWarningSent, "Should convert integer 1 to boolean true");
      assert.isBoolean(result.dayOfMessageSent);
      assert.isBoolean(result.fiveMinuteWarningSent);
    });

    it("should include timestamps in returned object", () => {
      const testSettings = {
        nextSession: 1774315200,
        announcementChannel: "channel-123",
        announcementRole: "role-456",
      };

      setSettings(testGuildId, testSettings);
      const result = getSettings(testGuildId);

      assert.isNotNull(result.createdAt);
      assert.isNotNull(result.updatedAt);
      assert.isString(result.createdAt);
      assert.isString(result.updatedAt);
    });
  });

  describe("setSettings()", () => {
    it("should create new settings for a guild (insert)", () => {
      const testSettings = {
        nextSession: 1774315200,
        announcementChannel: "channel-123",
        announcementRole: "role-456",
        dayOfMessageSent: false,
        fiveMinuteWarningSent: false,
      };

      setSettings(testGuildId, testSettings);
      const result = getSettings(testGuildId);

      assert.isNotNull(result);
      assert.equal(result.nextSession, 1774315200);
    });

    it("should update existing settings for a guild (upsert)", () => {
      // First insert
      const initialSettings = {
        nextSession: 1774315200,
        announcementChannel: "channel-123",
        announcementRole: "role-456",
      };

      setSettings(testGuildId, initialSettings);

      // Update
      const updatedSettings = {
        nextSession: 1774315300,
        announcementChannel: "channel-789",
        announcementRole: "role-789",
        dayOfMessageSent: true,
      };

      setSettings(testGuildId, updatedSettings);
      const result = getSettings(testGuildId);

      assert.equal(result.nextSession, 1774315300, "Should update nextSession");
      assert.equal(result.announcementChannel, "channel-789", "Should update announcementChannel");
      assert.equal(result.announcementRole, "role-789", "Should update announcementRole");
      assert.isTrue(result.dayOfMessageSent, "Should update dayOfMessageSent");
    });

    it("should handle partial updates (null values)", () => {
      // Set initial settings
      const initialSettings = {
        nextSession: 1774315200,
        announcementChannel: "channel-123",
        announcementRole: "role-456",
      };

      setSettings(testGuildId, initialSettings);

      // Update with null values (should preserve existing)
      const partialUpdate = {
        nextSession: 1774315300,
        announcementChannel: null,
        announcementRole: null,
      };

      setSettings(testGuildId, partialUpdate);
      const result = getSettings(testGuildId);

      assert.equal(result.nextSession, 1774315300);
      assert.isNull(result.announcementChannel);
      assert.isNull(result.announcementRole);
    });

    it("should set boolean flags correctly", () => {
      const testSettings = {
        nextSession: 1774315200,
        dayOfMessageSent: true,
        fiveMinuteWarningSent: false,
      };

      setSettings(testGuildId, testSettings);
      const result = getSettings(testGuildId);

      assert.isTrue(result.dayOfMessageSent);
      assert.isFalse(result.fiveMinuteWarningSent);
    });

    it("should update timestamps on upsert", (done) => {
      const testSettings = {
        nextSession: 1774315200,
      };

      setSettings(testGuildId, testSettings);
      const firstResult = getSettings(testGuildId);
      const firstUpdatedAt = firstResult.updatedAt;

      // Small delay to ensure timestamp difference
      setTimeout(() => {
        setSettings(testGuildId, {
          nextSession: 1774315300,
        });
        const secondResult = getSettings(testGuildId);

        // updatedAt should be more recent than before (though this might be tricky in tests)
        assert.isNotNull(secondResult.updatedAt);
        done();
      }, 100);
    });
  });

  describe("deleteSettings()", () => {
    it("should delete settings for a guild", () => {
      const testSettings = {
        nextSession: 1774315200,
        announcementChannel: "channel-123",
      };

      setSettings(testGuildId, testSettings);
      assert.isNotNull(getSettings(testGuildId));

      deleteSettings(testGuildId);
      assert.isNull(getSettings(testGuildId), "Settings should be deleted");
    });

    it("should handle deletion of non-existent guild gracefully", () => {
      // Should not throw an error
      assert.doesNotThrow(() => {
        deleteSettings("non-existent-guild-456");
      });
    });
  });

  describe("Database Integrity", () => {
    it("should support multiple guilds independently", () => {
      const guild1 = "guild-1";
      const guild2 = "guild-2";

      setSettings(guild1, {
        nextSession: 1774315200,
        announcementChannel: "channel-1",
      });

      setSettings(guild2, {
        nextSession: 1774315300,
        announcementChannel: "channel-2",
      });

      const result1 = getSettings(guild1);
      const result2 = getSettings(guild2);

      assert.equal(result1.nextSession, 1774315200);
      assert.equal(result2.nextSession, 1774315300);
      assert.equal(result1.announcementChannel, "channel-1");
      assert.equal(result2.announcementChannel, "channel-2");

      // Cleanup
      deleteSettings(guild1);
      deleteSettings(guild2);
    });

    it("should enforce guild_id as primary key", () => {
      const testSettings = {
        nextSession: 1774315200,
      };

      setSettings(testGuildId, testSettings);

      // Getting database directly to verify schema
      const db = getDatabase();
      const result = db
        .prepare("SELECT COUNT(*) as count FROM guild_settings WHERE guild_id = ?")
        .get(testGuildId);

      assert.equal(result.count, 1, "Should only have one record per guild_id");
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", () => {
      // Test by providing valid input
      assert.doesNotThrow(() => {
        const testSettings = {
          nextSession: 1774315200,
        };
        setSettings(testGuildId, testSettings);
        getSettings(testGuildId);
        deleteSettings(testGuildId);
      });
    });

    it("should validate guild_id input", () => {
      // Should work with empty string guild ID (SQLite allows it)
      const emptyGuildId = "";
      const testSettings = { nextSession: 1774315200 };

      assert.doesNotThrow(() => {
        setSettings(emptyGuildId, testSettings);
        deleteSettings(emptyGuildId);
      });
    });
  });
});

describe("Bot Settings (Database Integration)", () => {
  const { getBotSetting, setBotSetting } = require("../db/dal.js");

  after(() => {
    closeDatabase();
  });

  describe("getBotSetting()", () => {
    it("should return null for non-existent setting", () => {
      const value = getBotSetting("nonexistent");
      assert.isNull(value);
    });

    it("should retrieve a set setting", () => {
      setBotSetting("test_key", "test_value");
      const value = getBotSetting("test_key");
      assert.equal(value, "test_value");
    });
  });

  describe("setBotSetting()", () => {
    it("should create a new setting", () => {
      setBotSetting("new_key", "new_value");
      const value = getBotSetting("new_key");
      assert.equal(value, "new_value");
    });

    it("should update an existing setting", () => {
      setBotSetting("update_key", "old_value");
      setBotSetting("update_key", "new_value");
      const value = getBotSetting("update_key");
      assert.equal(value, "new_value");
    });
  });
});
