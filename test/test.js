const { assert } = require("chai");
const fs = require("node:fs");
const path = require("node:path");
const setNextCommand = require("../commands/setnext.js");
const nextCommand = require("../commands/next.js");
const setOwnerCommand = require("../commands/setowner.js");

const configPath = path.resolve(__dirname, "..", "config.json");

// Mock message object
let lastReply = "";
const mockMessage = {
  reply: (msg) => {
    lastReply = msg;
  },
  channel: {
    send: (msg) => {
      lastReply = msg;
    },
  },
  author: {
    id: "123456789",
  },
};

describe("Date Commands", () => {
  let originalConfig;

  beforeEach(() => {
    // Save original config
    originalConfig = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(originalConfig);
    config.owner = "123456789";
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
  });

  afterEach(() => {
    // Restore original config
    fs.writeFileSync(configPath, originalConfig, "utf8");
  });

  it("!setnext should set the next session time", (done) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const mockMessageWithDone = {
      ...mockMessage,
      reply: (msg) => {
        lastReply = msg;
        // Reading the file to check if the value was written
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        assert.equal(config.nextSession, timestamp);
        assert.include(lastReply, "Next session time has been set!");
        done();
      },
    };
    setNextCommand.execute(mockMessageWithDone, [timestamp.toString()]);
  });

  it("!next should display the next session time", () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    config.nextSession = timestamp;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

    nextCommand.execute(mockMessage, []);
    assert.equal(lastReply, `The next session is scheduled for <t:${timestamp}:R>`);
  });

  it("!next should show a message if session is not set", () => {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    config.nextSession = undefined;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

    nextCommand.execute(mockMessage, []);
    assert.equal(
      lastReply,
      "The next session has not been set yet. Use the `!setnext` command to set it.",
    );
  });

  it("!setnext should handle invalid timestamp", () => {
    setNextCommand.execute(mockMessage, ["not-a-timestamp"]);
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
    const mockMessageWithDone = {
      ...mockMessage,
      reply: (msg) => {
        lastReply = msg;
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        assert.equal(config.owner, "123456789");
        assert.equal(
          lastReply,
          "You have been set as the owner! You can now use the `setnext` command.",
        );
        done();
      },
    };
    // Clear owner for the test
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    config.owner = undefined;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

    setOwnerCommand.execute(mockMessageWithDone, []);
  });

  it("!setowner should not set the owner if one is already set", () => {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    config.owner = "987654321";
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

    setOwnerCommand.execute(mockMessage, []);
    assert.equal(
      lastReply,
      "The owner has already been set. Contact the current owner to change it.",
    );
  });
});
