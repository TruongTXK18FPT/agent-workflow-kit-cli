import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { analyzeModule } from "../src/core/analyzer.js";

describe("Codebase Analyzer", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "awk-test-analyzer-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("should detect Maven and feature-first with modern validation/testing by default", async () => {
    // Write pom.xml to identify spring-boot
    await fs.writeFile(path.join(tmpDir, "pom.xml"), "<project></project>", "utf8");

    // Write a standard spring-boot folder structure
    const basePkgDir = path.join(tmpDir, "src/main/java/com/acme/app");
    await fs.mkdir(basePkgDir, { recursive: true });

    // Write Application.java in basePkgDir to stop package traversal
    await fs.writeFile(
      path.join(basePkgDir, "Application.java"),
      "@SpringBootApplication public class Application {}",
      "utf8"
    );

    // Write feature package to look like feature-first
    const featureDir = path.join(basePkgDir, "customer/controller");
    await fs.mkdir(featureDir, { recursive: true });

    // Write a dummy Java file with jakarta validation
    await fs.writeFile(
      path.join(featureDir, "CustomerController.java"),
      "import jakarta.validation.constraints.NotNull;\npublic class CustomerController {}",
      "utf8"
    );

    const testDir = path.join(tmpDir, "src/test/java/com/acme/app/customer");
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(
      path.join(testDir, "CustomerControllerTest.java"),
      "import org.junit.jupiter.api.Test;\npublic class CustomerControllerTest {}",
      "utf8"
    );

    const context = await analyzeModule(tmpDir, ["spring-boot"]);
    const sb = context["spring-boot"];

    expect(sb).toBeDefined();
    expect(sb?.buildTool).toBe("maven");
    expect(sb?.buildCommand).toBe("mvn"); // no wrapper yet
    expect(sb?.basePackage).toBe("com.acme.app");
    expect(sb?.packagePath).toBe("com/acme/app");
    expect(sb?.validationLibrary).toBe("jakarta.validation");
    expect(sb?.testFramework).toBe("JUnit 5");
    expect(sb?.packageLayout).toBe("feature-first");
  });

  it("should detect Gradle, layer-first layout and legacy javax validation", async () => {
    // Write build.gradle to identify gradle
    await fs.writeFile(path.join(tmpDir, "build.gradle"), "// gradle file", "utf8");
    // Write gradlew wrapper file
    await fs.writeFile(path.join(tmpDir, "gradlew"), "#!/bin/sh", "utf8");

    // Write a layer-first structure: controller and service folders at base package level
    const basePkgDir = path.join(tmpDir, "src/main/java/com/example/api");
    await fs.mkdir(path.join(basePkgDir, "controller"), { recursive: true });
    await fs.mkdir(path.join(basePkgDir, "service"), { recursive: true });

    // Write dummy Java files importing javax.validation
    await fs.writeFile(
      path.join(basePkgDir, "controller/UserController.java"),
      "import javax.validation.constraints.NotBlank;\npublic class UserController {}",
      "utf8"
    );

    // Write JUnit 4 test files
    const testDir = path.join(tmpDir, "src/test/java/com/example/api/controller");
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(
      path.join(testDir, "UserControllerTest.java"),
      "import org.junit.Test;\npublic class UserControllerTest {}",
      "utf8"
    );

    const context = await analyzeModule(tmpDir, ["spring-boot"]);
    const sb = context["spring-boot"];

    expect(sb).toBeDefined();
    expect(sb?.buildTool).toBe("gradle");
    expect(sb?.buildCommand).toBe("./gradlew");
    expect(sb?.basePackage).toBe("com.example.api");
    expect(sb?.packageLayout).toBe("layer-first");
    expect(sb?.validationLibrary).toBe("javax.validation");
    expect(sb?.testFramework).toBe("JUnit 4");
    expect(sb?.isMicroservice).toBe(false); // standard monolith
  });

  it("should detect microservice configuration and dependencies", async () => {
    // Write pom.xml with eureka-client dependency
    await fs.writeFile(
      path.join(tmpDir, "pom.xml"),
      "<project><dependency><artifactId>spring-cloud-starter-netflix-eureka-client</artifactId></dependency></project>",
      "utf8"
    );

    // Create resources dir
    const resourcesDir = path.join(tmpDir, "src/main/resources");
    await fs.mkdir(resourcesDir, { recursive: true });

    // Write application.yml with app name and port
    const ymlContent = `
server:
  port: 8087
spring:
  application:
    name: order-service
`;
    await fs.writeFile(path.join(resourcesDir, "application.yml"), ymlContent, "utf8");

    const context = await analyzeModule(tmpDir, ["spring-boot"]);
    const sb = context["spring-boot"];

    expect(sb).toBeDefined();
    expect(sb?.isMicroservice).toBe(true);
    expect(sb?.springApplicationName).toBe("order-service");
    expect(sb?.serverPort).toBe("8087");
  });

  it("should analyze python-ai properties and dependencies correctly", async () => {
    // Write pyproject.toml with poetry dependencies
    await fs.writeFile(
      path.join(tmpDir, "pyproject.toml"),
      "[tool.poetry.dependencies]\ntorch = '^2.1.0'\nopencv-python = '*'",
      "utf8"
    );
    // Write poetry.lock file to trigger poetry
    await fs.writeFile(path.join(tmpDir, "poetry.lock"), "", "utf8");

    const context = await analyzeModule(tmpDir, ["python-ai"]);
    const ai = context["python-ai"];

    expect(ai).toBeDefined();
    expect(ai?.packageManager).toBe("poetry");
    expect(ai?.runCommand).toBe("poetry run python");
    expect(ai?.hasGpuLibraries).toBe(true);
    expect(ai?.hasHardwareLibraries).toBe(true);
  });

  it("should analyze react-ts lock files and return correct execute command context", async () => {
    // 1. Check npm default (no lock file)
    let context = await analyzeModule(tmpDir, ["react-ts"]);
    let react = context["react-ts"];
    expect(react).toBeDefined();
    expect(react?.packageManager).toBe("npm");
    expect(react?.runCommand).toBe("npm run");
    expect(react?.executeCommand).toBe("npx");
    expect(react?.lockFile).toBe("package-lock.json");

    // 2. Check pnpm lock detection
    await fs.writeFile(path.join(tmpDir, "pnpm-lock.yaml"), "", "utf8");
    context = await analyzeModule(tmpDir, ["react-ts"]);
    react = context["react-ts"];
    expect(react?.packageManager).toBe("pnpm");
    expect(react?.runCommand).toBe("pnpm");
    expect(react?.executeCommand).toBe("pnpm dlx");
    expect(react?.lockFile).toBe("pnpm-lock.yaml");
    await fs.unlink(path.join(tmpDir, "pnpm-lock.yaml"));

    // 3. Check bun lockb detection
    await fs.writeFile(path.join(tmpDir, "bun.lockb"), "", "utf8");
    context = await analyzeModule(tmpDir, ["react-ts"]);
    react = context["react-ts"];
    expect(react?.packageManager).toBe("bun");
    expect(react?.runCommand).toBe("bun run");
    expect(react?.executeCommand).toBe("bunx");
    expect(react?.lockFile).toBe("bun.lockb");
    await fs.unlink(path.join(tmpDir, "bun.lockb"));
  });

  it("should analyze next-js, nestjs, and express context correctly", async () => {
    await fs.writeFile(path.join(tmpDir, "package-lock.json"), "", "utf8");
    const context = await analyzeModule(tmpDir, ["next-js", "nestjs", "express"]);
    
    expect(context["next-js"]).toBeDefined();
    expect(context["next-js"]?.packageManager).toBe("npm");
    expect(context["next-js"]?.runCommand).toBe("npm run");
    expect(context["next-js"]?.executeCommand).toBe("npx");
    expect(context["next-js"]?.lockFile).toBe("package-lock.json");

    expect(context["nestjs"]).toBeDefined();
    expect(context["nestjs"]?.packageManager).toBe("npm");
    expect(context["nestjs"]?.lockFile).toBe("package-lock.json");

    expect(context["express"]).toBeDefined();
    expect(context["express"]?.packageManager).toBe("npm");
    expect(context["express"]?.lockFile).toBe("package-lock.json");
    
    await fs.unlink(path.join(tmpDir, "package-lock.json"));
  });
});
