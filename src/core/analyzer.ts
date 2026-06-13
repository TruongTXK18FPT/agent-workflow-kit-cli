/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { promises as fs } from "fs";
import path from "path";
import { ProjectStack } from "./detector.js";

export interface SpringBootContext {
  buildTool: "maven" | "gradle";
  buildCommand: string;
  buildVerifyArgs: string;
  packageLayout: "feature-first" | "layer-first";
  basePackage: string;
  packagePath: string; // e.g. "com/acme/app"
  validationLibrary: "jakarta.validation" | "javax.validation";
  testFramework: "JUnit 5" | "JUnit 4";
  isMicroservice: boolean;
  springApplicationName: string;
  serverPort: string;
}

export interface ReactTsContext {
  packageManager: "npm" | "yarn" | "pnpm" | "bun";
  runCommand: string;
  executeCommand: string;
  lockFile: string;
}

export interface NextJsContext {
  packageManager: "npm" | "yarn" | "pnpm" | "bun";
  runCommand: string;
  executeCommand: string;
  lockFile: string;
}

export interface NestJsContext {
  packageManager: "npm" | "yarn" | "pnpm" | "bun";
  runCommand: string;
  executeCommand: string;
  lockFile: string;
}

export interface ExpressContext {
  packageManager: "npm" | "yarn" | "pnpm" | "bun";
  runCommand: string;
  executeCommand: string;
  lockFile: string;
}

export interface FastAPIContext {
  packageManager: "pip" | "poetry" | "pipenv";
  runCommand: string;
}

export interface PythonAiContext {
  packageManager: "pip" | "poetry" | "pipenv";
  runCommand: string;
  hasGpuLibraries: boolean;
  hasHardwareLibraries: boolean;
}

export interface DotnetContext {
  solutionName: string;
  projectNames: string[];
  dotnetVersion: string;
  testProjects: string[];
}

export interface GolangContext {
  goVersion: string;
  moduleName: string;
}

export interface RustContext {
  projectName: string;
  rustEdition: string;
  isWorkspace: boolean;
}

export interface AnalysisContext {
  "spring-boot"?: SpringBootContext;
  "react-ts"?: ReactTsContext;
  "next-js"?: NextJsContext;
  "nestjs"?: NestJsContext;
  "express"?: ExpressContext;
  "fastapi"?: FastAPIContext;
  "python-ai"?: PythonAiContext;
  "dotnet"?: DotnetContext;
  "golang"?: GolangContext;
  "rust"?: RustContext;
}

/**
 * Helper to recursively find files with a specific extension, avoiding node_modules and build directories.
 */
async function findFilesRecursively(
  dir: string,
  extension: string,
  limit: number = 20
): Promise<string[]> {
  const results: string[] = [];

  async function traverse(currentDir: string) {
    if (results.length >= limit) return;
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (results.length >= limit) return;
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          // Skip build and package manager folders
          if (
            entry.name.startsWith(".") ||
            entry.name === "node_modules" ||
            entry.name === "target" ||
            entry.name === "build" ||
            entry.name === "dist" ||
            entry.name === "bin" ||
            entry.name === "out" ||
            entry.name === "gradle"
          ) {
            continue;
          }
          await traverse(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(extension)) {
          results.push(fullPath);
        }
      }
    } catch {
      // Ignore read errors
    }
  }

  await traverse(dir);
  return results;
}

/**
 * Simple parser for properties files.
 */
export function parsePropertiesSimple(content: string): { appName?: string; port?: string } {
  const lines = content.split("\n");
  let appName: string | undefined;
  let port: string | undefined;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("!")) continue;
    const eqIndex = trimmed.indexOf("=");
    const colonIndex = trimmed.indexOf(":");
    let sepIndex = -1;

    if (eqIndex !== -1 && colonIndex !== -1) {
      sepIndex = Math.min(eqIndex, colonIndex);
    } else {
      sepIndex = eqIndex !== -1 ? eqIndex : colonIndex;
    }

    if (sepIndex !== -1) {
      const key = trimmed.substring(0, sepIndex).trim();
      const value = trimmed.substring(sepIndex + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key === "spring.application.name") {
        appName = value;
      } else if (key === "server.port") {
        port = value;
      }
    }
  }
  return { appName, port };
}

/**
 * Simple parser for YAML files.
 */
export function parseYamlSimple(content: string): { appName?: string; port?: string } {
  const lines = content.split("\n");
  const contextPath: { key: string; indent: number }[] = [];
  let appName: string | undefined;
  let port: string | undefined;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Determine indentation
    const indent = line.length - line.trimStart().length;

    // Pop context paths that are deeper or equal to current indent level
    while (contextPath.length > 0 && indent <= contextPath[contextPath.length - 1].indent) {
      contextPath.pop();
    }

    const colonIndex = trimmed.indexOf(":");
    if (colonIndex !== -1) {
      const key = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();

      contextPath.push({ key, indent });

      const fullKeyPath = contextPath.map((c) => c.key).join(".");

      if (value) {
        const cleanVal = value.replace(/^['"]|['"]$/g, "");
        if (fullKeyPath === "spring.application.name") {
          appName = cleanVal;
        } else if (fullKeyPath === "server.port") {
          port = cleanVal;
        }
      }
    }
  }
  return { appName, port };
}

/**
 * Analyzes Java Spring Boot project details.
 */
async function analyzeSpringBoot(dir: string): Promise<SpringBootContext> {
  // 1. Detect Build Tool & Commands
  let buildTool: "maven" | "gradle" = "maven";
  let buildCommand = "./mvnw";
  let buildVerifyArgs = "verify";
  let isMicroservice = false;

  try {
    const isGradle =
      (await fs.stat(path.join(dir, "build.gradle")).then((s) => s.isFile()).catch(() => false)) ||
      (await fs.stat(path.join(dir, "build.gradle.kts")).then((s) => s.isFile()).catch(() => false));

    if (isGradle) {
      buildTool = "gradle";
      const hasWrapper = await fs.stat(path.join(dir, "gradlew")).then((s) => s.isFile()).catch(() => false);
      buildCommand = hasWrapper ? "./gradlew" : "gradle";
      buildVerifyArgs = "check";
    } else {
      const hasWrapper = await fs.stat(path.join(dir, "mvnw")).then((s) => s.isFile()).catch(() => false);
      buildCommand = hasWrapper ? "./mvnw" : "mvn";
      buildVerifyArgs = "verify";
    }
  } catch {
    // Use default maven settings
  }

  // Check build files for microservice dependencies
  const buildFilesToCheck = ["pom.xml", "build.gradle", "build.gradle.kts"];
  for (const file of buildFilesToCheck) {
    try {
      const content = await fs.readFile(path.join(dir, file), "utf8");
      if (
        content.includes("spring-cloud") ||
        content.includes("eureka") ||
        content.includes("openfeign") ||
        content.includes("consul") ||
        content.includes("nacos")
      ) {
        isMicroservice = true;
      }
    } catch {
      // Ignore if file doesn't exist
    }
  }

  // 2. Base Package Path and package-to-dot-notation detection
  let basePackage = "com.acme.app";
  let packagePath = "com/acme/app";
  const javaSrcRoot = path.join(dir, "src/main/java");
  let javaSrcRootExists = false;

  try {
    const stat = await fs.stat(javaSrcRoot);
    javaSrcRootExists = stat.isDirectory();
  } catch {
    // src/main/java doesn't exist
  }

  let basePackageFullPath = javaSrcRoot;
  if (javaSrcRootExists) {
    let currentDir = javaSrcRoot;
    const packageParts: string[] = [];
    while (true) {
      try {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });
        const subdirs = entries.filter((e) => e.isDirectory() && !e.name.startsWith("."));
        const files = entries.filter((e) => e.isFile());

        // Traverse down if exactly one subdirectory and no Java/static files inside this directory level
        if (subdirs.length === 1 && files.length === 0) {
          const subDirName = subdirs[0].name;
          packageParts.push(subDirName);
          currentDir = path.join(currentDir, subDirName);
        } else {
          break;
        }
      } catch {
        break;
      }
    }
    if (packageParts.length > 0) {
      basePackage = packageParts.join(".");
      packagePath = packageParts.join("/");
      basePackageFullPath = currentDir;
    }
  }

  // 3. Package Layout Detection (feature-first vs layer-first)
  let packageLayout: "feature-first" | "layer-first" = "feature-first";
  if (javaSrcRootExists) {
    try {
      const entries = await fs.readdir(basePackageFullPath, { withFileTypes: true });
      const subdirs = entries.filter((e) => e.isDirectory() && !e.name.startsWith("."));

      const layerKeywords = new Set([
        "controller",
        "controllers",
        "service",
        "services",
        "repository",
        "repositories",
        "entity",
        "entities",
        "model",
        "models",
        "dto",
        "dtos",
        "mapper",
        "mappers",
        "config",
        "configs",
        "web",
      ]);

      let matchingLayerDirsCount = 0;
      for (const subdir of subdirs) {
        if (layerKeywords.has(subdir.name.toLowerCase())) {
          matchingLayerDirsCount++;
        }
      }

      if (matchingLayerDirsCount >= 2) {
        packageLayout = "layer-first";
      } else {
        // Try sampling child packages to see if they hold feature sub-packages with layers inside
        let looksLikeFeatureFirst = false;
        const sampleLimit = Math.min(subdirs.length, 3);
        for (let i = 0; i < sampleLimit; i++) {
          const subDirPath = path.join(basePackageFullPath, subdirs[i].name);
          const subEntries = await fs.readdir(subDirPath, { withFileTypes: true });
          const nestedDirs = subEntries.filter((e) => e.isDirectory() && !e.name.startsWith("."));
          const hasLayerInside = nestedDirs.some((nd) => layerKeywords.has(nd.name.toLowerCase()));
          if (hasLayerInside) {
            looksLikeFeatureFirst = true;
            break;
          }
        }
        packageLayout = looksLikeFeatureFirst ? "feature-first" : "feature-first"; // Default to feature-first
      }
    } catch {
      // Fallback
    }
  }

  // 4. Validation Library Detection (Jakarta vs Javax)
  let validationLibrary: "jakarta.validation" | "javax.validation" = "jakarta.validation";
  if (javaSrcRootExists) {
    try {
      const javaFiles = await findFilesRecursively(basePackageFullPath, ".java", 20);
      for (const file of javaFiles) {
        const content = await fs.readFile(file, "utf8");
        if (content.includes("import javax.validation.")) {
          validationLibrary = "javax.validation";
          break;
        } else if (content.includes("import jakarta.validation.")) {
          validationLibrary = "jakarta.validation";
          break;
        }
      }
    } catch {
      // Fallback
    }
  }

  // 5. Test Framework Detection
  let testFramework: "JUnit 5" | "JUnit 4" = "JUnit 5";
  const javaTestRoot = path.join(dir, "src/test/java");
  let javaTestRootExists = false;

  try {
    const stat = await fs.stat(javaTestRoot);
    javaTestRootExists = stat.isDirectory();
  } catch {
    // src/test/java doesn't exist
  }

  if (javaTestRootExists) {
    try {
      const testFiles = await findFilesRecursively(javaTestRoot, ".java", 20);
      for (const file of testFiles) {
        const content = await fs.readFile(file, "utf8");
        if (content.includes("org.junit.jupiter.")) {
          testFramework = "JUnit 5";
          break;
        } else if (content.includes("org.junit.Test")) {
          testFramework = "JUnit 4";
          break;
        }
      }
    } catch {
      // Fallback
    }
  }

  // 6. Microservice properties scanning (service name and port)
  let springApplicationName = path.basename(dir);
  let serverPort = "8080";

  const configFiles = [
    "application.properties",
    "application.yml",
    "application.yaml",
    "bootstrap.properties",
    "bootstrap.yml",
    "bootstrap.yaml",
  ];

  const resourcesDir = path.join(dir, "src/main/resources");
  for (const file of configFiles) {
    try {
      const filePath = path.join(resourcesDir, file);
      const content = await fs.readFile(filePath, "utf8");
      const parsed = file.endsWith(".properties")
        ? parsePropertiesSimple(content)
        : parseYamlSimple(content);

      if (parsed.appName) {
        springApplicationName = parsed.appName;
        isMicroservice = true;
      }
      if (parsed.port) {
        serverPort = parsed.port;
      }
    } catch {
      // Ignore if file doesn't exist or is unreadable
    }
  }

  return {
    buildTool,
    buildCommand,
    buildVerifyArgs,
    packageLayout,
    basePackage,
    packagePath,
    validationLibrary,
    testFramework,
    isMicroservice,
    springApplicationName,
    serverPort,
  };
}

/**
 * Analyzes React TypeScript project details.
 */
async function analyzeReactTs(dir: string): Promise<ReactTsContext> {
  let packageManager: "npm" | "yarn" | "pnpm" | "bun" = "npm";
  let runCommand = "npm run";
  let executeCommand = "npx";
  let lockFile = "package-lock.json";

  try {
    const hasYarnLock = await fs.stat(path.join(dir, "yarn.lock")).then((s) => s.isFile()).catch(() => false);
    const hasPnpmLock = await fs.stat(path.join(dir, "pnpm-lock.yaml")).then((s) => s.isFile()).catch(() => false);
    const hasBunLockb = await fs.stat(path.join(dir, "bun.lockb")).then((s) => s.isFile()).catch(() => false);
    const hasBunLock = await fs.stat(path.join(dir, "bun.lock")).then((s) => s.isFile()).catch(() => false);

    if (hasYarnLock) {
      packageManager = "yarn";
      runCommand = "yarn";
      executeCommand = "yarn dlx";
      lockFile = "yarn.lock";
    } else if (hasPnpmLock) {
      packageManager = "pnpm";
      runCommand = "pnpm";
      executeCommand = "pnpm dlx";
      lockFile = "pnpm-lock.yaml";
    } else if (hasBunLockb || hasBunLock) {
      packageManager = "bun";
      runCommand = "bun run";
      executeCommand = "bunx";
      lockFile = hasBunLockb ? "bun.lockb" : "bun.lock";
    }
  } catch {
    // Use default
  }

  return { packageManager, runCommand, executeCommand, lockFile };
}

/**
 * Analyzes FastAPI project details.
 */
async function analyzeFastApi(dir: string): Promise<FastAPIContext> {
  let packageManager: "pip" | "poetry" | "pipenv" = "pip";
  let runCommand = "python";

  try {
    const hasPoetry = await fs.stat(path.join(dir, "poetry.lock")).then((s) => s.isFile()).catch(() => false);
    const hasPipenv = await fs.stat(path.join(dir, "Pipfile")).then((s) => s.isFile()).catch(() => false);

    if (hasPoetry) {
      packageManager = "poetry";
      runCommand = "poetry run";
    } else if (hasPipenv) {
      packageManager = "pipenv";
      runCommand = "pipenv run";
    }
  } catch {
    // Use default
  }

  return { packageManager, runCommand };
}

/**
 * Analyzes Python AI project details.
 */
async function analyzePythonAi(dir: string): Promise<PythonAiContext> {
  let packageManager: "pip" | "poetry" | "pipenv" = "pip";
  let runCommand = "python";
  let hasGpuLibraries = false;
  let hasHardwareLibraries = false;

  try {
    const hasPoetry = await fs.stat(path.join(dir, "poetry.lock")).then((s) => s.isFile()).catch(() => false);
    const hasPipenv = await fs.stat(path.join(dir, "Pipfile")).then((s) => s.isFile()).catch(() => false);

    if (hasPoetry) {
      packageManager = "poetry";
      runCommand = "poetry run python";
    } else if (hasPipenv) {
      packageManager = "pipenv";
      runCommand = "pipenv run python";
    }
  } catch {
    // Use default
  }

  // Scan requirements / pyproject to check for GPU and Hardware references
  const checkGpuKws = ["torch", "tensorflow", "cuda", "onnxruntime-gpu"];
  const checkHwKws = ["opencv-python", "mediapipe", "pyserial", "pyaudio", "picamera", "opencv"];

  const buildFiles = ["requirements.txt", "pyproject.toml", "Pipfile"];
  for (const file of buildFiles) {
    try {
      const content = await fs.readFile(path.join(dir, file), "utf8");
      if (checkGpuKws.some(kw => content.includes(kw))) {
        hasGpuLibraries = true;
      }
      if (checkHwKws.some(kw => content.includes(kw))) {
        hasHardwareLibraries = true;
      }
    } catch {
      // Ignore
    }
  }

  return { packageManager, runCommand, hasGpuLibraries, hasHardwareLibraries };
}

/**
 * Analyzes Next.js project details.
 */
async function analyzeNextJs(dir: string): Promise<NextJsContext> {
  const ctx = await analyzeReactTs(dir);
  return {
    packageManager: ctx.packageManager,
    runCommand: ctx.runCommand,
    executeCommand: ctx.executeCommand,
    lockFile: ctx.lockFile,
  };
}

/**
 * Analyzes NestJS project details.
 */
async function analyzeNestJs(dir: string): Promise<NestJsContext> {
  const ctx = await analyzeReactTs(dir);
  return {
    packageManager: ctx.packageManager,
    runCommand: ctx.runCommand,
    executeCommand: ctx.executeCommand,
    lockFile: ctx.lockFile,
  };
}

/**
 * Analyzes Express.js project details.
 */
async function analyzeExpress(dir: string): Promise<ExpressContext> {
  const ctx = await analyzeReactTs(dir);
  return {
    packageManager: ctx.packageManager,
    runCommand: ctx.runCommand,
    executeCommand: ctx.executeCommand,
    lockFile: ctx.lockFile,
  };
}

/**
 * Entry point to analyze module configurations.
 */
export async function analyzeModule(dir: string, stacks: ProjectStack[]): Promise<AnalysisContext> {
  const context: AnalysisContext = {};

  for (const stack of stacks) {
    if (stack === "spring-boot") {
      context["spring-boot"] = await analyzeSpringBoot(dir);
    } else if (stack === "react-ts") {
      context["react-ts"] = await analyzeReactTs(dir);
    } else if (stack === "next-js") {
      context["next-js"] = await analyzeNextJs(dir);
    } else if (stack === "nestjs") {
      context["nestjs"] = await analyzeNestJs(dir);
    } else if (stack === "express") {
      context["express"] = await analyzeExpress(dir);
    } else if (stack === "fastapi") {
      context["fastapi"] = await analyzeFastApi(dir);
    } else if (stack === "python-ai") {
      context["python-ai"] = await analyzePythonAi(dir);
    } else if (stack === "dotnet") {
      context["dotnet"] = await analyzeDotnet(dir);
    } else if (stack === "golang") {
      context["golang"] = await analyzeGolang(dir);
    } else if (stack === "rust") {
      context["rust"] = await analyzeRust(dir);
    }
  }

  return context;
}

/**
 * Analyzes dotnet project details.
 */
async function analyzeDotnet(dir: string): Promise<DotnetContext> {
  let solutionName = path.basename(dir);
  const projectNames: string[] = [];
  const testProjects: string[] = [];
  let dotnetVersion = "8.0";

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    // Find .sln file
    const slnFile = entries.find(e => e.isFile() && e.name.endsWith(".sln"));
    if (slnFile) {
      solutionName = path.parse(slnFile.name).name;
    }

    // Find all .csproj files (recursively)
    const csprojFiles = await findCsprojFiles(dir);
    for (const file of csprojFiles) {
      const projName = path.parse(file).name;
      try {
        const content = await fs.readFile(file, "utf8");
        if (content.includes("Microsoft.NET.Test.Sdk") || projName.toLowerCase().includes("test")) {
          testProjects.push(projName);
        } else {
          projectNames.push(projName);
        }

        // Try to parse TargetFramework
        const match = content.match(/<TargetFramework>net([\d\.]+)<\/TargetFramework>/);
        if (match && match[1]) {
          dotnetVersion = match[1];
        }
      } catch {
        projectNames.push(projName);
      }
    }
  } catch {
    // Keep defaults
  }

  return {
    solutionName,
    projectNames,
    dotnetVersion,
    testProjects,
  };
}

async function findCsprojFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  async function traverse(currentDir: string) {
    if (files.length >= 20) return;
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (files.length >= 20) return;
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          if (
            entry.name.startsWith(".") ||
            entry.name === "node_modules" ||
            entry.name === "bin" ||
            entry.name === "obj" ||
            entry.name === "target" ||
            entry.name === "build" ||
            entry.name === "dist"
          ) {
            continue;
          }
          await traverse(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".csproj")) {
          files.push(fullPath);
        }
      }
    } catch {
      // Ignore
    }
  }
  await traverse(dir);
  return files;
}

async function analyzeGolang(dir: string): Promise<GolangContext> {
  let goVersion = "1.22";
  let moduleName = path.basename(dir);

  try {
    const goModPath = path.join(dir, "go.mod");
    const content = await fs.readFile(goModPath, "utf8");
    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("module ")) {
        moduleName = trimmed.replace("module ", "").trim();
      } else if (trimmed.startsWith("go ")) {
        goVersion = trimmed.replace("go ", "").trim();
      }
    }
  } catch {
    // Keep default
  }

  return { goVersion, moduleName };
}

async function analyzeRust(dir: string): Promise<RustContext> {
  let projectName = path.basename(dir);
  let rustEdition = "2021";
  let isWorkspace = false;

  try {
    const cargoTomlPath = path.join(dir, "Cargo.toml");
    const content = await fs.readFile(cargoTomlPath, "utf8");
    if (content.includes("[workspace]")) {
      isWorkspace = true;
    }
    
    // Very basic parsing for name and edition
    const lines = content.split("\n");
    let inPackageSection = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("[package]")) {
        inPackageSection = true;
      } else if (trimmed.startsWith("[")) {
        inPackageSection = false;
      }

      if (inPackageSection) {
        if (trimmed.startsWith("name")) {
          const match = trimmed.match(/name\s*=\s*"(.*)"/);
          if (match && match[1]) {
            projectName = match[1];
          }
        } else if (trimmed.startsWith("edition")) {
          const match = trimmed.match(/edition\s*=\s*"(.*)"/);
          if (match && match[1]) {
            rustEdition = match[1];
          }
        }
      }
    }
  } catch {
    // Keep default
  }

  return { projectName, rustEdition, isWorkspace };
}
