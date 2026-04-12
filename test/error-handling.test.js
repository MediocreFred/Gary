const { assert } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

let lastReply = "";
const makeMockInteraction = ({
  userId = "123456789",
  when = null,
  guildId = "test-guild",
} = {}) => ({
  user: { id: userId },
  guildId,
  guild: { ownerId: userId },
  options: { getString: () => when },
  reply: (payload) => {
    if (typeof payload === "string") lastReply = payload;
    else if (payload?.content) lastReply = payload.content;
    else lastReply = undefined;
    return Promise.resolve();
  },
  channel: {
    send: (msg) => {
      lastReply = msg;
    },
  },
});

describe("Error handling", () => {
  let nextCommand, setNextCommand, setOwnerCommand;
  let getSettingsStub, setSettingsStub, setBotSettingStub, getBotSettingStub;

  beforeEach(() => {
    lastReply = "";
    getSettingsStub = sinon.stub();
    setSettingsStub = sinon.stub();
    setBotSettingStub = sinon.stub();
    getBotSettingStub = sinon.stub().returns(null);

    nextCommand = proxyquire("../src/commands/next.js", {
      "../../db/dal.js": { getSettings: getSettingsStub }
    });

    setNextCommand = proxyquire("../src/commands/setnext.js", {
      "../../db/dal.js": { getSettings: getSettingsStub, setSettings: setSettingsStub, getBotSetting: setBotSettingStub }
    });

    setOwnerCommand = proxyquire("../src/commands/setowner.js", {
      "../../db/dal.js": { setBotSetting: setBotSettingStub, getBotSetting: getBotSettingStub }
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it("next should handle config read error", () => {
    getSettingsStub.throws(new Error("boom"));

    const mock = makeMockInteraction();
    nextCommand.execute(mock);

    assert.equal(lastReply, "There was an error retrieving the schedule.");
  });

  it("setnext should handle write error", (done) => {
    // Ensure owner is set so the command proceeds
    setBotSettingStub.returns("123456789");

    setSettingsStub.throws(new Error("disk"));

    const mockWithDone = makeMockInteraction({ when: Math.floor(Date.now() / 1000).toString() });
    mockWithDone.reply = (payload) => {
      const m = typeof payload === "string" ? payload : payload.content;
      lastReply = m;
      assert.equal(lastReply, "There was an error setting the next session.");
      done();
    };

    setNextCommand.execute(mockWithDone);
  });

  it("setnext should require owner permission", () => {
    setBotSettingStub.returns("different-owner");

    const mockNonOwner = makeMockInteraction({
      userId: "000000",
      when: Math.floor(Date.now() / 1000).toString(),
    });
    setNextCommand.execute(mockNonOwner);
    assert.equal(lastReply, "Only the owner can set the next session time.");
  });

  it("setowner should handle write error", (done) => {
    // Clear owner for the test
    setBotSettingStub.throws(new Error("disk"));

    const mockWithDone = makeMockInteraction();
    mockWithDone.reply = (payload) => {
      const m = typeof payload === "string" ? payload : payload.content;
      lastReply = m;
      assert.equal(lastReply, "There was an error setting the owner.");
      done();
    };

    setOwnerCommand.execute(mockWithDone);
  });
});
