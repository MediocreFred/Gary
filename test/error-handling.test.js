const { assert } = require("chai");
const fs = require("node:fs");
const path = require("node:path");
const nextCommand = require("../src/commands/next.js");
const setNextCommand = require("../src/commands/setnext.js");
const setOwnerCommand = require("../src/commands/setowner.js");

const configPath = path.resolve(__dirname, "..", "config.json");

let lastReply = "";
const makeMockInteraction = ({ userId = "123456789", when = null } = {}) => ({
  user: { id: userId },
  options: { getString: (k) => when },
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

describe("Error handling", () => {
  it("next should handle config read error", () => {
    const orig = fs.readFileSync;
    fs.readFileSync = () => {
      throw new Error("boom");
    };

    const mock = makeMockInteraction();
    nextCommand.execute(mock);

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

    const mockWithDone = makeMockInteraction({ when: Math.floor(Date.now() / 1000).toString() });
    mockWithDone.reply = (payload) => {
      const m = typeof payload === "string" ? payload : payload.content;
      lastReply = m;
      assert.equal(lastReply, "There was an error setting the next session.");
      fs.writeFile = origWrite;
      fs.writeFileSync(configPath, origConfig, "utf8");
      done();
    };

    setNextCommand.execute(mockWithDone);
  });

  it("setnext should require owner permission", () => {
    const mockNonOwner = makeMockInteraction({
      userId: "000000",
      when: Math.floor(Date.now() / 1000).toString(),
    });
    setNextCommand.execute(mockNonOwner);
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

    const mockWithDone = makeMockInteraction();
    mockWithDone.reply = (payload) => {
      const m = typeof payload === "string" ? payload : payload.content;
      lastReply = m;
      assert.equal(lastReply, "There was an error setting the owner.");
      fs.writeFileSync = origWriteSync;
      fs.writeFileSync(configPath, origConfig, "utf8");
      done();
    };

    setOwnerCommand.execute(mockWithDone);
  });
});
