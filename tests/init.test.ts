import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { runInit } from "../src/cli/commands/init.js";

describe("init command", () => {
  let tmpDir: string;
  let originalCwd: () => string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "awk-test-init-"));
    originalCwd = process.cwd;
    process.cwd = () => tmpDir;
  });

  afterEach(async () => {
    process.cwd = originalCwd;
    await fs.rm(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("should create GEMINI.md, IDE rule files and update .gitignore when agent is antigravity", async () => {
    // Write a mock package.json so stack detector detects react-ts
    await fs.writeFile(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ dependencies: { react: "^19.0.0" } }),
      "utf8"
    );

    await runInit({
      stack: "auto",
      agent: "antigravity",
      dryRun: false,
    });

    // Verify GEMINI.md exists
    const geminiExists = await fs.stat(path.join(tmpDir, "GEMINI.md")).then(s => s.isFile()).catch(() => false);
    expect(geminiExists).toBe(true);

    // Verify AGENTS.md does not exist
    const agentsExists = await fs.stat(path.join(tmpDir, "AGENTS.md")).then(s => s.isFile()).catch(() => false);
    expect(agentsExists).toBe(false);

    // Verify IDE rules exist at root
    const cursorrules = await fs.readFile(path.join(tmpDir, ".cursorrules"), "utf8");
    expect(cursorrules).toContain("GEMINI.md");
    expect(cursorrules).not.toContain("AGENTS.md");

    // Verify .gitignore is updated at root
    const gitignoreContent = await fs.readFile(path.join(tmpDir, ".gitignore"), "utf8");
    expect(gitignoreContent).toContain(".cursorrules");
    expect(gitignoreContent).toContain(".copilot-instructions.md");
    expect(gitignoreContent).toContain(".clinerules");
  });

  it("should create AGENTS.md, IDE rule files and update .gitignore when agent is codex", async () => {
    await fs.writeFile(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ dependencies: { react: "^19.0.0" } }),
      "utf8"
    );

    await runInit({
      stack: "auto",
      agent: "codex",
      dryRun: false,
    });

    // Verify AGENTS.md exists
    const agentsExists = await fs.stat(path.join(tmpDir, "AGENTS.md")).then(s => s.isFile()).catch(() => false);
    expect(agentsExists).toBe(true);

    // Verify GEMINI.md does not exist
    const geminiExists = await fs.stat(path.join(tmpDir, "GEMINI.md")).then(s => s.isFile()).catch(() => false);
    expect(geminiExists).toBe(false);

    // Verify IDE rules exist and reference AGENTS.md
    const cursorrules = await fs.readFile(path.join(tmpDir, ".cursorrules"), "utf8");
    expect(cursorrules).toContain("AGENTS.md");
    expect(cursorrules).not.toContain("GEMINI.md");

    // Verify .gitignore is updated
    const gitignoreContent = await fs.readFile(path.join(tmpDir, ".gitignore"), "utf8");
    expect(gitignoreContent).toContain(".cursorrules");
  });

  it("should create both GEMINI.md and AGENTS.md when agent is both", async () => {
    await fs.writeFile(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ dependencies: { react: "^19.0.0" } }),
      "utf8"
    );

    await runInit({
      stack: "auto",
      agent: "both",
      dryRun: false,
    });

    const geminiExists = await fs.stat(path.join(tmpDir, "GEMINI.md")).then(s => s.isFile()).catch(() => false);
    expect(geminiExists).toBe(true);

    const agentsExists = await fs.stat(path.join(tmpDir, "AGENTS.md")).then(s => s.isFile()).catch(() => false);
    expect(agentsExists).toBe(true);

    const cursorrules = await fs.readFile(path.join(tmpDir, ".cursorrules"), "utf8");
    expect(cursorrules).toContain("GEMINI.md");
    expect(cursorrules).toContain("AGENTS.md");
  });

  it("should respect dry-run and not write files or update gitignore", async () => {
    await fs.writeFile(
      path.join(tmpDir, "package.json"),
      JSON.stringify({ dependencies: { react: "^19.0.0" } }),
      "utf8"
    );

    await runInit({
      stack: "auto",
      agent: "both",
      dryRun: true,
    });

    const geminiExists = await fs.stat(path.join(tmpDir, "GEMINI.md")).then(s => s.isFile()).catch(() => false);
    expect(geminiExists).toBe(false);

    const agentsExists = await fs.stat(path.join(tmpDir, "AGENTS.md")).then(s => s.isFile()).catch(() => false);
    expect(agentsExists).toBe(false);

    const cursorrulesExists = await fs.stat(path.join(tmpDir, ".cursorrules")).then(s => s.isFile()).catch(() => false);
    expect(cursorrulesExists).toBe(false);

    const gitignoreExists = await fs.stat(path.join(tmpDir, ".gitignore")).then(s => s.isFile()).catch(() => false);
    expect(gitignoreExists).toBe(false);
  });

  it("should write IDE rules only at root of monorepos, and not in module subdirectories", async () => {
    // Create nested frontend module
    const frontendDir = path.join(tmpDir, "frontend");
    await fs.mkdir(frontendDir, { recursive: true });
    await fs.writeFile(
      path.join(frontendDir, "package.json"),
      JSON.stringify({ dependencies: { react: "^19.0.0" } }),
      "utf8"
    );

    // Create nested backend module
    const backendDir = path.join(tmpDir, "backend");
    await fs.mkdir(backendDir, { recursive: true });
    await fs.writeFile(path.join(backendDir, "pom.xml"), "<project></project>", "utf8");

    await runInit({
      stack: "auto",
      agent: "antigravity",
      dryRun: false,
    });

    // Root should have GEMINI.md and IDE rules
    expect(await fs.stat(path.join(tmpDir, "GEMINI.md")).then(s => s.isFile())).toBe(true);
    expect(await fs.stat(path.join(tmpDir, ".cursorrules")).then(s => s.isFile())).toBe(true);
    expect(await fs.readFile(path.join(tmpDir, ".gitignore"), "utf8")).toContain(".cursorrules");

    // Submodules should have GEMINI.md but NOT IDE rules
    expect(await fs.stat(path.join(frontendDir, "GEMINI.md")).then(s => s.isFile())).toBe(true);
    expect(await fs.stat(path.join(backendDir, "GEMINI.md")).then(s => s.isFile())).toBe(true);

    const frontendCursorRulesExists = await fs.stat(path.join(frontendDir, ".cursorrules")).then(s => s.isFile()).catch(() => false);
    expect(frontendCursorRulesExists).toBe(false);

    const backendCursorRulesExists = await fs.stat(path.join(backendDir, ".cursorrules")).then(s => s.isFile()).catch(() => false);
    expect(backendCursorRulesExists).toBe(false);
  });
});
