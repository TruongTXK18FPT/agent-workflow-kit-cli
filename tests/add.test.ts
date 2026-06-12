import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { runAdd } from "../src/cli/commands/add.js";

describe("add command", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "awk-test-add-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("should write stack specific guidelines and rules", async () => {
    await runAdd("react-ts", {
      path: tmpDir,
      agent: "both",
      dryRun: false
    });

    const agentsContent = await fs.readFile(path.join(tmpDir, "AGENTS.md"), "utf8");
    expect(agentsContent).toContain("React + TypeScript Guidelines");

    const ruleStat = await fs.stat(path.join(tmpDir, ".agents", "rules", "react-style.md"));
    expect(ruleStat.isFile()).toBe(true);

    const skillStat = await fs.stat(path.join(tmpDir, ".agents", "skills", "react-feature", "SKILL.md"));
    expect(skillStat.isFile()).toBe(true);
  });

  it("should respect dry-run parameter and print without writing files", async () => {
    await runAdd("react-ts", {
      path: tmpDir,
      agent: "both",
      dryRun: true
    });

    await expect(fs.access(path.join(tmpDir, "AGENTS.md"))).rejects.toThrow();
  });
});
