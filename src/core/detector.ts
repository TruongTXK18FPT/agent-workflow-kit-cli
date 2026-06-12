/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { promises as fs } from "fs";
import path from "path";

export type ProjectStack = "spring-boot" | "react-ts" | "fastapi" | "python-ai";

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

  // 2. Detect React + TypeScript (package.json containing react dependency)
  try {
    const pkgPath = path.join(cwd, "package.json");
    const content = await fs.readFile(pkgPath, "utf8");
    const pkgJson = JSON.parse(content);
    const hasReact =
      (pkgJson.dependencies && pkgJson.dependencies.react) ||
      (pkgJson.devDependencies && pkgJson.devDependencies.react);
    if (hasReact) {
      stacks.push("react-ts");
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
      // Ignore
    }
  }

  return stacks;
}

/**
 * Scans the workspace directory and subfolders (1-level deep) for monorepo detection.
 */
export async function detectProjectStack(cwd: string): Promise<ProjectStack[]> {
  const stacks = await detectProjectStackDirect(cwd);

  // Scan 1-level deep subdirectories for potential monorepos/multimodules
  try {
    const entries = await fs.readdir(cwd, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        entry.name !== "node_modules" &&
        entry.name !== "dist"
      ) {
        const subPath = path.join(cwd, entry.name);
        const subStacks = await detectProjectStackDirect(subPath);
        for (const stack of subStacks) {
          if (!stacks.includes(stack)) {
            stacks.push(stack);
          }
        }
      }
    }
  } catch {
    // Ignore
  }

  return stacks;
}

export interface ProjectModule {
  dir: string;
  name: string;
  stacks: ProjectStack[];
}

/**
 * Detects stacks grouped by module directories (root + 1-level deep directories).
 */
export async function detectProjectModules(cwd: string): Promise<ProjectModule[]> {
  const modules: ProjectModule[] = [];

  const rootStacks = await detectProjectStackDirect(cwd);
  if (rootStacks.length > 0) {
    modules.push({
      dir: cwd,
      name: ".",
      stacks: rootStacks,
    });
  }

  try {
    const entries = await fs.readdir(cwd, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        entry.name !== "node_modules" &&
        entry.name !== "dist"
      ) {
        const subPath = path.join(cwd, entry.name);
        const subStacks = await detectProjectStackDirect(subPath);
        if (subStacks.length > 0) {
          modules.push({
            dir: subPath,
            name: entry.name,
            stacks: subStacks,
          });
        }
      }
    }
  } catch {
    // Ignore
  }

  return modules;
}

