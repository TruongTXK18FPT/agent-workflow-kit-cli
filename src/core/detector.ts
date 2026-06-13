/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { promises as fs } from "fs";
import path from "path";

export type ProjectStack = "spring-boot" | "react-ts" | "next-js" | "nestjs" | "express" | "fastapi" | "python-ai" | "dotnet" | "golang" | "rust";

/**
 * Scans a specific folder directly for manifest configurations.
 */
async function detectProjectStackDirect(cwd: string): Promise<ProjectStack[]> {
  const stacks: ProjectStack[] = [];

  // 1. Detect Java Spring Boot (pom.xml, build.gradle, or build.gradle.kts)
  try {
    const pomPath = path.join(cwd, "pom.xml");
    const stat = await fs.stat(pomPath);
    if (stat.isFile()) {
      stacks.push("spring-boot");
    }
  } catch {
    try {
      const gradlePath = path.join(cwd, "build.gradle");
      const stat = await fs.stat(gradlePath);
      if (stat.isFile()) {
        stacks.push("spring-boot");
      }
    } catch {
      try {
        const gradleKtsPath = path.join(cwd, "build.gradle.kts");
        const stat = await fs.stat(gradleKtsPath);
        if (stat.isFile()) {
          stacks.push("spring-boot");
        }
      } catch {
        // Ignore
      }
    }
  }

  // 2. Detect Node.js / JavaScript / TypeScript stacks (React, Next.js, NestJS, Express)
  try {
    const pkgPath = path.join(cwd, "package.json");
    const content = await fs.readFile(pkgPath, "utf8");
    const pkgJson = JSON.parse(content);
    
    const deps = pkgJson.dependencies || {};
    const devDeps = pkgJson.devDependencies || {};

    const hasReact = deps.react || devDeps.react;
    const hasNext = deps.next || devDeps.next;
    const hasNest = deps["@nestjs/core"] || devDeps["@nestjs/core"];
    const hasExpress = deps.express || devDeps.express;

    if (hasNext) {
      stacks.push("next-js");
    } else if (hasReact) {
      stacks.push("react-ts");
    }

    const hasNestConfig = await fs.stat(path.join(cwd, "nest-cli.json")).then((s) => s.isFile()).catch(() => false);
    if (hasNest || hasNestConfig) {
      stacks.push("nestjs");
    } else if (hasExpress) {
      stacks.push("express");
    }
  } catch {
    // Ignore
  }

  // 3. Detect Python FastAPI & Python AI
  const aiKeywords = [
    "torch",
    "tensorflow",
    "scikit-learn",
    "transformers",
    "langchain",
    "llama-index",
    "opencv-python",
    "mediapipe",
    "numpy",
    "pandas"
  ];

  try {
    const pyprojectPath = path.join(cwd, "pyproject.toml");
    const content = await fs.readFile(pyprojectPath, "utf8");
    if (content.includes("fastapi")) {
      stacks.push("fastapi");
    }
    if (aiKeywords.some(kw => content.includes(kw))) {
      stacks.push("python-ai");
    }
  } catch {
    try {
      const reqPath = path.join(cwd, "requirements.txt");
      const content = await fs.readFile(reqPath, "utf8");
      if (content.includes("fastapi")) {
        stacks.push("fastapi");
      }
      if (aiKeywords.some(kw => content.includes(kw))) {
        stacks.push("python-ai");
      }
    } catch {
      try {
        const pipfilePath = path.join(cwd, "Pipfile");
        const content = await fs.readFile(pipfilePath, "utf8");
        if (content.includes("fastapi")) {
          stacks.push("fastapi");
        }
        if (aiKeywords.some(kw => content.includes(kw))) {
          stacks.push("python-ai");
        }
      } catch {
        // Ignore
      }
    }
  }

  // 4. Detect .NET (files ending in .csproj or .sln, or global.json)
  try {
    const entries = await fs.readdir(cwd, { withFileTypes: true });
    const hasDotnet = entries.some(
      (entry) =>
        entry.isFile() &&
        (entry.name.endsWith(".csproj") ||
          entry.name.endsWith(".sln") ||
          entry.name === "global.json")
    );
    if (hasDotnet) {
      stacks.push("dotnet");
    }
  } catch {
    // Ignore
  }

  // 5. Detect Golang (go.mod)
  try {
    const goModPath = path.join(cwd, "go.mod");
    const stat = await fs.stat(goModPath);
    if (stat.isFile()) {
      stacks.push("golang");
    }
  } catch {
    // Ignore
  }

  // 6. Detect Rust (Cargo.toml)
  try {
    const cargoTomlPath = path.join(cwd, "Cargo.toml");
    const stat = await fs.stat(cargoTomlPath);
    if (stat.isFile()) {
      stacks.push("rust");
    }
  } catch {
    // Ignore
  }

  return stacks;
}

/**
 * Helper to recursively search for modules containing manifest configurations up to maxDepth.
 */
async function findModulesRecursively(
  baseDir: string,
  currentDir: string,
  maxDepth: number,
  currentDepth: number = 0
): Promise<ProjectModule[]> {
  const modules: ProjectModule[] = [];

  // Skip standard build and internal directories to avoid deep scans
  const dirName = path.basename(currentDir);
  if (
    dirName.startsWith(".") ||
    dirName === "node_modules" ||
    dirName === "target" ||
    dirName === "build" ||
    dirName === "dist" ||
    dirName === "bin" ||
    dirName === "out" ||
    dirName === "venv" ||
    dirName === ".venv"
  ) {
    return modules;
  }

  // Detect direct stack presets in this current directory
  const directStacks = await detectProjectStackDirect(currentDir);
  if (directStacks.length > 0) {
    modules.push({
      dir: currentDir,
      name: currentDir === baseDir ? "." : path.relative(baseDir, currentDir).replace(/\\/g, "/"),
      stacks: directStacks,
    });
  }

  // If we haven't hit max depth, traverse subdirectories
  if (currentDepth < maxDepth) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const subPath = path.join(currentDir, entry.name);
          const subModules = await findModulesRecursively(baseDir, subPath, maxDepth, currentDepth + 1);
          modules.push(...subModules);
        }
      }
    } catch {
      // Ignore directory read errors
    }
  }

  return modules;
}

/**
 * Scans the workspace directory and subfolders (up to 3 levels deep) for monorepo detection.
 */
export async function detectProjectStack(cwd: string): Promise<ProjectStack[]> {
  const modules = await detectProjectModules(cwd);
  const stacks = new Set<ProjectStack>();
  for (const mod of modules) {
    for (const stack of mod.stacks) {
      stacks.add(stack);
    }
  }
  return Array.from(stacks);
}

export interface ProjectModule {
  dir: string;
  name: string;
  stacks: ProjectStack[];
}

/**
 * Detects stacks grouped by module directories (root + up to 3 levels deep directories).
 */
export async function detectProjectModules(cwd: string): Promise<ProjectModule[]> {
  return findModulesRecursively(cwd, cwd, 3);
}
