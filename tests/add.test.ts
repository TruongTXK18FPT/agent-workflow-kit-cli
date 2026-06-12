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

  it("should write stack specific guidelines and rules for both agents", async () => {
    await runAdd("react-ts", {
      path: tmpDir,
      agent: "both",
      dryRun: false
    });

    const agentsContent = await fs.readFile(path.join(tmpDir, "AGENTS.md"), "utf8");
    expect(agentsContent).toContain("React + TypeScript Guidelines");

    const geminiContent = await fs.readFile(path.join(tmpDir, "GEMINI.md"), "utf8");
    expect(geminiContent).toContain("React + TypeScript Guidelines");

    const ruleStat = await fs.stat(path.join(tmpDir, ".agents", "rules", "react-style.md"));
    expect(ruleStat.isFile()).toBe(true);

    const skillStat = await fs.stat(path.join(tmpDir, ".agents", "skills", "react-feature", "SKILL.md"));
    expect(skillStat.isFile()).toBe(true);

    const cursorrules = await fs.readFile(path.join(tmpDir, ".cursorrules"), "utf8");
    expect(cursorrules).toContain("GEMINI.md");
    expect(cursorrules).toContain("AGENTS.md");

    const gitignore = await fs.readFile(path.join(tmpDir, ".gitignore"), "utf8");
    expect(gitignore).toContain(".cursorrules");
    expect(gitignore).toContain(".clinerules");
  });

  it("should write only GEMINI.md and IDE rule files when agent is antigravity", async () => {
    await runAdd("react-ts", {
      path: tmpDir,
      agent: "antigravity",
      dryRun: false
    });

    const geminiContent = await fs.readFile(path.join(tmpDir, "GEMINI.md"), "utf8");
    expect(geminiContent).toContain("React + TypeScript Guidelines");

    const agentsExists = await fs.stat(path.join(tmpDir, "AGENTS.md")).then(s => s.isFile()).catch(() => false);
    expect(agentsExists).toBe(false);

    const cursorrules = await fs.readFile(path.join(tmpDir, ".cursorrules"), "utf8");
    expect(cursorrules).toContain("GEMINI.md");
    expect(cursorrules).not.toContain("AGENTS.md");

    const gitignore = await fs.readFile(path.join(tmpDir, ".gitignore"), "utf8");
    expect(gitignore).toContain(".cursorrules");
  });

  it("should write only AGENTS.md and IDE rule files when agent is codex", async () => {
    await runAdd("react-ts", {
      path: tmpDir,
      agent: "codex",
      dryRun: false
    });

    const agentsContent = await fs.readFile(path.join(tmpDir, "AGENTS.md"), "utf8");
    expect(agentsContent).toContain("React + TypeScript Guidelines");

    const geminiExists = await fs.stat(path.join(tmpDir, "GEMINI.md")).then(s => s.isFile()).catch(() => false);
    expect(geminiExists).toBe(false);

    const cursorrules = await fs.readFile(path.join(tmpDir, ".cursorrules"), "utf8");
    expect(cursorrules).toContain("AGENTS.md");
    expect(cursorrules).not.toContain("GEMINI.md");

    const gitignore = await fs.readFile(path.join(tmpDir, ".gitignore"), "utf8");
    expect(gitignore).toContain(".cursorrules");
  });

  it("should respect dry-run parameter and print without writing files", async () => {
    await runAdd("react-ts", {
      path: tmpDir,
      agent: "both",
      dryRun: true
    });

    await expect(fs.access(path.join(tmpDir, "AGENTS.md"))).rejects.toThrow();
    await expect(fs.access(path.join(tmpDir, "GEMINI.md"))).rejects.toThrow();
    await expect(fs.access(path.join(tmpDir, ".cursorrules"))).rejects.toThrow();
    await expect(fs.access(path.join(tmpDir, ".gitignore"))).rejects.toThrow();
  });
});
