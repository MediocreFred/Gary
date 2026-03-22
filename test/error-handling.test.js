const { assert } = require("chai");
const fs = require("node:fs");
const path = require("node:path");
const nextCommand = require("../commands/next.js");
const setNextCommand = require("../commands/setnext.js");
const setOwnerCommand = require("../commands/setowner.js");

const configPath = path.resolve(__dirname, "..", "config.json");

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

describe("Error handling", () => {
  it("next should handle config read error", () => {
    const orig = fs.readFileSync;
    fs.readFileSync = () => {
      throw new Error("boom");
    };

    nextCommand.execute(mockMessage, []);

    assert.equal(lastReply, "There was an error retrieving the schedule.");

    fs.readFileSync = orig;
  });

  it("setnext should handle write error", (done) => {
    // Ensure owner is set so the command proceeds
    const origConfig = fs.readFileSync(configPath, "utf8");
    const cfg = JSON.parse(origConfig);
    cfg.owner = "123456789";
    fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), "utf8");

    const origWrite = fs.writeFile;
    fs.writeFile = (p, data, cb) => cb(new Error("disk"));

    const mockWithDone = {
      ...mockMessage,
      reply: (msg) => {
        lastReply = msg;
        assert.equal(lastReply, "There was an error setting the next session.");
        fs.writeFile = origWrite;
        // restore original config
        fs.writeFileSync(configPath, origConfig, "utf8");
        done();
      },
    };

    setNextCommand.execute(mockWithDone, [Math.floor(Date.now() / 1000).toString()]);
  });

  it("setnext should require owner permission", () => {
    const mockNonOwner = {
      ...mockMessage,
      author: { id: "000000" },
      reply: (msg) => {
        lastReply = msg;
      },
    };

    setNextCommand.execute(mockNonOwner, [Math.floor(Date.now() / 1000).toString()]);
    assert.equal(lastReply, "Only the owner can set the next session time.");
  });

  it("setowner should handle write error", (done) => {
    // Clear owner for the test
    const origConfig = fs.readFileSync(configPath, "utf8");
    const cfg = JSON.parse(origConfig);
    cfg.owner = undefined;
    fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), "utf8");

    const origWriteSync = fs.writeFileSync;
    fs.writeFileSync = () => {
      throw new Error("disk");
    };

    const mockWithDone = {
      ...mockMessage,
      reply: (msg) => {
        lastReply = msg;
        assert.equal(lastReply, "There was an error setting the owner.");
        fs.writeFileSync = origWriteSync;
        // restore original config
        fs.writeFileSync(configPath, origConfig, "utf8");
        done();
      },
    };

    setOwnerCommand.execute(mockWithDone, []);
  });
});
