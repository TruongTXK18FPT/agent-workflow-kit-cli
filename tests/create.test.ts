import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { runCreate } from "../src/cli/commands/create.js";

describe("create command", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "awk-test-create-"));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {
      // Ignore teardown cleanup errors if any process holds lock momentarily
    }
    vi.restoreAllMocks();
  });

  it("should create a react-ts project with package.json and run init", async () => {
    const projectName = "my-test-react-app";
    const projectPath = path.join(tmpDir, projectName);

    await runCreate("react-ts", projectName, { dryRun: false });

    // Verify project files are created
    const pkgJsonPath = path.join(projectPath, "package.json");
    const pkgJsonContent = await fs.readFile(pkgJsonPath, "utf8");
    expect(pkgJsonContent).toContain(projectName);
    expect(pkgJsonContent).toContain('"react": "^18.3.1"');

    // Verify source files are created
    const counterExists = await fs.stat(path.join(projectPath, "src", "components", "Counter.tsx")).then(s => s.isFile()).catch(() => false);
    expect(counterExists).toBe(true);

    const appCssExists = await fs.stat(path.join(projectPath, "src", "styles", "App.css")).then(s => s.isFile()).catch(() => false);
    expect(appCssExists).toBe(true);

    // Verify .gitignore is created and updated
    const gitignoreContent = await fs.readFile(path.join(projectPath, ".gitignore"), "utf8");
    expect(gitignoreContent).toContain("node_modules");
    // Should also include IDE rules because runInit runs
    expect(gitignoreContent).toContain(".cursorrules");

    // Verify init has run and generated GEMINI.md and .cursorrules
    const geminiExists = await fs.stat(path.join(projectPath, "GEMINI.md")).then(s => s.isFile()).catch(() => false);
    expect(geminiExists).toBe(true);

    const cursorrulesExists = await fs.stat(path.join(projectPath, ".cursorrules")).then(s => s.isFile()).catch(() => false);
    expect(cursorrulesExists).toBe(true);
  });

  it("should create a spring-boot project with pom.xml and correct packages", async () => {
    const projectName = "my-spring-app";
    const projectPath = path.join(tmpDir, projectName);

    await runCreate("spring-boot", projectName, { dryRun: false });

    // Verify pom.xml exists and has correct projectName
    const pomContent = await fs.readFile(path.join(projectPath, "pom.xml"), "utf8");
    expect(pomContent).toContain(`<artifactId>${projectName}</artifactId>`);
    expect(pomContent).toContain("<java.version>17</java.version>");

    // Verify Java package directory structure mapping 'packageName' -> 'myspringapp'
    const packagePath = path.join(projectPath, "src", "main", "java", "com", "example", "myspringapp");
    const demoAppExists = await fs.stat(path.join(packagePath, "DemoApplication.java")).then(s => s.isFile()).catch(() => false);
    expect(demoAppExists).toBe(true);

    // Verify DemoApplication package declaration inside file
    const demoAppContent = await fs.readFile(path.join(packagePath, "DemoApplication.java"), "utf8");
    expect(demoAppContent).toContain("package com.example.myspringapp;");

    // Verify layered structure files
    const userEntityExists = await fs.stat(path.join(packagePath, "entity", "User.java")).then(s => s.isFile()).catch(() => false);
    expect(userEntityExists).toBe(true);

    const userControllerExists = await fs.stat(path.join(packagePath, "controller", "UserController.java")).then(s => s.isFile()).catch(() => false);
    expect(userControllerExists).toBe(true);

    // Verify init has run
    const agentsExists = await fs.stat(path.join(projectPath, "AGENTS.md")).then(s => s.isFile()).catch(() => false);
    expect(agentsExists).toBe(true);
  });

  it("should respect dry-run and not write files", async () => {
    const projectName = "dry-run-project";
    const projectPath = path.join(tmpDir, projectName);

    await runCreate("react-ts", projectName, { dryRun: true });

    const dirExists = await fs.stat(projectPath).then(s => s.isDirectory()).catch(() => false);
    expect(dirExists).toBe(false);
  });
});
