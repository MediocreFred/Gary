const { assert } = require("chai");
const fs = require("node:fs");
const path = require("node:path");
const setNextCommand = require("../src/commands/setnext.js");
const nextCommand = require("../src/commands/next.js");
const setOwnerCommand = require("../src/commands/setowner.js");
const { getSettings, setSettings, setBotSetting, deleteSettings, getBotSetting } = require("../db/dal.js");

const configPath = path.resolve(__dirname, "..", "config.json");

// Mock message object
let lastReply = "";
const makeMockInteraction = ({ userId = "123456789", guildId = "test-guild", when } = {}) => ({
  user: { id: userId },
  guildId,
  options: {
    getString: (name) => name === "when" ? when : undefined,
  },
  reply: (payload) => {
    if (typeof payload === "string") lastReply = payload;
    else if (payload?.content) lastReply = payload.content;
    else lastReply = undefined;
  },
  channel: {
    send: (msg) => {
      lastReply = msg;
    },
  },
});

describe("Date Commands", () => {
  let originalConfig;

  before(() => {
    // Save original config
    originalConfig = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(originalConfig);
    config.owner = "123456789";
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

    // Set owner in database
    setBotSetting("owner", "123456789");
  });

  after(() => {
    // Restore original config
    fs.writeFileSync(configPath, originalConfig, "utf8");
  });

  beforeEach(() => {
    // Clean up test data
    try {
      deleteSettings("test-guild");
    } catch (error) {
      console.error("Error cleaning up test data:", error.message);
    }
  });

  afterEach(() => {
    // Clean up test data
    try {
      deleteSettings("test-guild");
    } catch (error) {
      console.error("Error cleaning up test data:", error.message);
    }
  });

  it("!setnext should set the next session time", (done) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const mockMessageWithDone = makeMockInteraction({ when: timestamp.toString() });
    mockMessageWithDone.reply = (payload) => {
      const msg = typeof payload === "string" ? payload : payload.content;
      lastReply = msg;
      const settings = getSettings("test-guild");
      assert.equal(settings.nextSession, timestamp);
      assert.include(lastReply, "Next session time has been set!");
      done();
    };
    setNextCommand.execute(mockMessageWithDone);
  });

  it("!next should display the next session time", () => {
    const timestamp = Math.floor(Date.now() / 1000);
    setSettings("test-guild", { nextSession: timestamp });

    const mock = makeMockInteraction();
    nextCommand.execute(mock);
    assert.equal(lastReply, `The next session is scheduled for <t:${timestamp}:R>`);
  });

  it("!next should show a message if session is not set", () => {
    const mock = makeMockInteraction();
    nextCommand.execute(mock);
    assert.equal(
      lastReply,
      "The next session has not been set yet. Use the `/setnext` command to set it.",
    );
  });

  it("!setnext should handle invalid timestamp", () => {
    const mockInvalid = makeMockInteraction({ when: "not-a-timestamp" });
    setNextCommand.execute(mockInvalid);
    assert.equal(
      lastReply,
      'Please provide a valid date/time string in the format "YYYY-MM-DD HH:mm".',
    );
  });
});

describe("Owner Commands", () => {
  let originalConfig;

  beforeEach(() => {
    // Save original config
    originalConfig = fs.readFileSync(configPath, "utf8");
  });

  afterEach(() => {
    // Restore original config
    fs.writeFileSync(configPath, originalConfig, "utf8");
  });

  it("!setowner should set the owner", (done) => {
    const mockMessageWithDone = makeMockInteraction();
    mockMessageWithDone.reply = (payload) => {
      const msg = typeof payload === "string" ? payload : payload.content;
      lastReply = msg;
      const owner = getBotSetting("owner");
      assert.equal(owner, "123456789");
      assert.equal(
        lastReply,
        "You have been set as the owner! You can now use the `/setnext` command.",
      );
      done();
    };
    // Clear owner for the test
    setBotSetting("owner", null);

    setOwnerCommand.execute(mockMessageWithDone);
  });

  it("!setowner should not set the owner if one is already set", () => {
    setBotSetting("owner", "987654321");

    const mock = makeMockInteraction();
    setOwnerCommand.execute(mock);
    assert.equal(
      lastReply,
      "The owner has already been set. Contact the current owner to change it.",
    );
  });
});
