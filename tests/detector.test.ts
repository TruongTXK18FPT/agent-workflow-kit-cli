import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { detectProjectStack, detectProjectModules } from "../src/core/detector.js";

describe("Stack Detector", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "awk-test-detector-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("should detect react-ts if package.json contains react", async () => {
    const pkgJson = {
      dependencies: {
        react: "^19.0.0",
      },
    };
    await fs.writeFile(
      path.join(tmpDir, "package.json"),
      JSON.stringify(pkgJson),
      "utf8"
    );

    const stacks = await detectProjectStack(tmpDir);
    expect(stacks).toContain("react-ts");

    const modules = await detectProjectModules(tmpDir);
    expect(modules).toHaveLength(1);
    expect(modules[0].name).toBe(".");
    expect(modules[0].stacks).toContain("react-ts");
  });

  it("should detect spring-boot if pom.xml exists", async () => {
    await fs.writeFile(path.join(tmpDir, "pom.xml"), "<project></project>", "utf8");

    const stacks = await detectProjectStack(tmpDir);
    expect(stacks).toContain("spring-boot");
  });

  it("should detect fastapi if pyproject.toml contains fastapi", async () => {
    await fs.writeFile(
      path.join(tmpDir, "pyproject.toml"),
      "[tool.poetry.dependencies]\nfastapi = '^0.100.0'",
      "utf8"
    );

    const stacks = await detectProjectStack(tmpDir);
    expect(stacks).toContain("fastapi");
  });

  it("should detect python-ai if requirements.txt contains AI libraries", async () => {
    await fs.writeFile(
      path.join(tmpDir, "requirements.txt"),
      "torch==2.1.2\nopencv-python==4.8.1.78\nnumpy>=1.24",
      "utf8"
    );

    const stacks = await detectProjectStack(tmpDir);
    expect(stacks).toContain("python-ai");
  });

  it("should detect monorepo structure with subdirectories", async () => {
    // Write react-ts in apps/frontend
    const subDir = path.join(tmpDir, "frontend");
    await fs.mkdir(subDir, { recursive: true });
    await fs.writeFile(
      path.join(subDir, "package.json"),
      JSON.stringify({ dependencies: { react: "^19.0.0" } }),
      "utf8"
    );

    // Write spring-boot in backend
    const backendDir = path.join(tmpDir, "backend");
    await fs.mkdir(backendDir, { recursive: true });
    await fs.writeFile(path.join(backendDir, "pom.xml"), "<project></project>", "utf8");

    const stacks = await detectProjectStack(tmpDir);
    expect(stacks).toContain("react-ts");
    expect(stacks).toContain("spring-boot");

    const modules = await detectProjectModules(tmpDir);
    expect(modules).toHaveLength(2);
    const names = modules.map((m) => m.name);
    expect(names).toContain("frontend");
    expect(names).toContain("backend");
  });

  it("should detect fastapi and python-ai if Pipfile contains them", async () => {
    await fs.writeFile(
      path.join(tmpDir, "Pipfile"),
      `[packages]\nfastapi = "*"\ntorch = "*"`,
      "utf8"
    );

    const stacks = await detectProjectStack(tmpDir);
    expect(stacks).toContain("fastapi");
    expect(stacks).toContain("python-ai");
  });

  it("should detect deep monorepo structure up to depth 3", async () => {
    // Write nested app at depth 3 (apps/sub/web)
    const deepDir = path.join(tmpDir, "apps", "sub", "web");
    await fs.mkdir(deepDir, { recursive: true });
    await fs.writeFile(
      path.join(deepDir, "package.json"),
      JSON.stringify({ dependencies: { react: "^19.0.0" } }),
      "utf8"
    );

    // Write nested app at depth 3 (services/nested/payment)
    const deeperDir = path.join(tmpDir, "services", "nested", "payment");
    await fs.mkdir(deeperDir, { recursive: true });
    await fs.writeFile(path.join(deeperDir, "pom.xml"), "<project></project>", "utf8");

    const stacks = await detectProjectStack(tmpDir);
    expect(stacks).toContain("react-ts");
    expect(stacks).toContain("spring-boot");

    const modules = await detectProjectModules(tmpDir);
    const names = modules.map((m) => m.name);
    expect(names).toContain("apps/sub/web");
    expect(names).toContain("services/nested/payment");
  });
});
