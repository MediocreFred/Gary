const { assert } = require("chai");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const { getSettings, setSettings, deleteSettings, getBotSetting, setBotSetting } = require("../db/dal.js");

const resetScriptPath = path.resolve(__dirname, "..", "reset.js");
const workspaceRoot = path.resolve(__dirname, "..");

describe("Reset script", () => {
  const testGuildId = "test-guild-reset-script";

  afterEach(() => {
    try {
      deleteSettings(testGuildId);
      setBotSetting("owner", "test-owner");
    } catch {
      // ignore cleanup errors
    }
  });

  it("should reset the bot owner when run with --reset-owner", () => {
    setBotSetting("owner", "123456789");

    const output = execFileSync("node", [resetScriptPath, "--reset-owner"], {
      cwd: workspaceRoot,
      encoding: "utf8",
    });

    assert.include(output, "Resetting bot owner...");
    assert.include(output, "Reset complete.");
    assert.isNull(getBotSetting("owner"));
  });

  it("should delete guild settings when run with --reset-guild and --guild", () => {
    setSettings(testGuildId, { nextSession: 1234567890 });

    const output = execFileSync("node", [resetScriptPath, "--reset-guild", "--guild", testGuildId], {
      cwd: workspaceRoot,
      encoding: "utf8",
    });

    assert.include(output, `Resetting settings for guild ${testGuildId}...`);
    assert.include(output, "Reset complete.");
    assert.isNull(getSettings(testGuildId));
  });
});
