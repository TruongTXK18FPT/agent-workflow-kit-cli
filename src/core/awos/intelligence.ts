/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { RepositoryContext, ModuleBoundary, TestingStrategy } from "./types.js";
import { detectProjectModules } from "../detector.js";
import { parseImports } from "../parser.js";
import { loadAWOSPlugins } from "./registry.js";

const CACHE_DIR = ".agents/cache";
const CACHE_FILE = path.join(CACHE_DIR, "repo_context.json");

/**
 * Calculates a composite MD5/SHA256 hash of all configuration manifest files in the repository.
 */
export async function calculateManifestHash(workspaceRoot: string): Promise<string> {
  const manifests = [
    "package.json",
    "package-lock.json",
    "pom.xml",
    "build.gradle",
    "build.gradle.kts",
    "pyproject.toml",
    "requirements.txt",
    "Pipfile",
    "tsconfig.json",
  ];

  const hash = crypto.createHash("sha256");
  let foundAny = false;

  for (const file of manifests) {
    const fullPath = path.join(workspaceRoot, file);
    try {
      const stat = await fs.stat(fullPath);
      if (stat.isFile()) {
        const content = await fs.readFile(fullPath);
        hash.update(file);
        hash.update(content);
        foundAny = true;
      }
    } catch {
      // Ignore missing manifest files
    }
  }

  // Also include directory structure hash of sub-modules
  try {
    const submodules = await detectProjectModules(workspaceRoot);
    for (const sub of submodules) {
      hash.update(sub.name);
      hash.update(sub.stacks.join(","));
    }
  } catch {
    // Ignore errors
  }

  return foundAny ? hash.digest("hex") : "no-manifests-hash";
}

/**
 * Parses files in a directory to identify imports and build a dependency relationship between directories.
 */
async function analyzeImportGraph(
  workspaceRoot: string,
  modules: string[]
): Promise<Record<string, string[]>> {
  const dependencies: Record<string, Set<string>> = {};
  for (const mod of modules) {
    dependencies[mod] = new Set<string>();
  }

  // Helper to find files recursively
  async function scanDir(dir: string, currentModule: string) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (
            entry.name.startsWith(".") ||
            entry.name === "node_modules" ||
            entry.name === "dist" ||
            entry.name === "build" ||
            entry.name === "target"
          ) {
            continue;
          }
          await scanDir(fullPath, currentModule);
        } else if (entry.isFile() && /\.(ts|tsx|java|py)$/.test(entry.name)) {
          const content = await fs.readFile(fullPath, "utf8");
          const parsedImports = await parseImports(fullPath, content);
          for (const importedRef of parsedImports) {
            for (const mod of modules) {
              if (
                mod !== currentModule &&
                (importedRef.includes(`/${mod}`) || importedRef.includes(`.${mod}`))
              ) {
                dependencies[currentModule].add(mod);
              }
            }
          }
        }
      }
    } catch {
      // Ignore read errors
    }
  }

  for (const mod of modules) {
    const modulePath = path.join(workspaceRoot, mod);
    await scanDir(modulePath, mod);
  }

  // Convert Sets to arrays
  const result: Record<string, string[]> = {};
  for (const [key, val] of Object.entries(dependencies)) {
    result[key] = Array.from(val);
  }
  return result;
}

/**
 * Builds a complete RepositoryContext for the given directory.
 */
export async function buildRepositoryContext(workspaceRoot: string): Promise<RepositoryContext> {
  const manifestHash = await calculateManifestHash(workspaceRoot);

  // 1. Detect modules
  const detectedModules = await detectProjectModules(workspaceRoot);
  const moduleNames = detectedModules.map((m) => m.name === "." ? "root" : m.name);

  // Analyze import boundaries
  const importGraph = await analyzeImportGraph(
    workspaceRoot,
    detectedModules.map((m) => m.name)
  );

  const moduleBoundaries: ModuleBoundary[] = detectedModules.map((m) => {
    const name = m.name === "." ? "root" : m.name;
    const dependencies = importGraph[m.name] || [];
    return {
      name,
      path: m.dir,
      dependencies,
    };
  });

  // Determine main stack & architecture
  let mainStack = "custom";
  const stackCounts: Record<string, number> = {};
  for (const m of detectedModules) {
    for (const s of m.stacks) {
      stackCounts[s] = (stackCounts[s] || 0) + 1;
    }
  }

  const sortedStacks = Object.entries(stackCounts).sort((a, b) => b[1] - a[1]);
  if (sortedStacks.length > 0) {
    mainStack = sortedStacks[0][0];
  }

  // Determine default architecture style based on stack
  let architecture = "layered";
  if (mainStack === "spring-boot") {
    architecture = "clean-architecture";
  } else if (mainStack === "react-ts" || mainStack === "next-js") {
    architecture = "feature-first";
  } else if (mainStack === "nestjs") {
    architecture = "module-driven";
  } else if (mainStack === "express") {
    architecture = "layered";
  } else if (mainStack === "fastapi") {
    architecture = "vertical-slice";
  }

  // Testing strategy defaults
  const frameworks: string[] = [];
  if (mainStack === "react-ts") {
    frameworks.push("vitest", "testing-library");
  } else if (mainStack === "next-js") {
    frameworks.push("jest", "playwright");
  } else if (mainStack === "nestjs" || mainStack === "express") {
    frameworks.push("jest", "supertest");
  } else if (mainStack === "spring-boot") {
    frameworks.push("junit", "mockito");
  } else if (mainStack === "fastapi") {
    frameworks.push("pytest");
  }

  const testing: TestingStrategy = {
    frameworks,
    coverageGoal: 80,
  };

  // Validation libraries defaults
  const validationLibraries: string[] = [];
  if (mainStack === "spring-boot") {
    validationLibraries.push("jakarta.validation");
  } else if (mainStack === "react-ts" || mainStack === "next-js" || mainStack === "express") {
    validationLibraries.push("zod");
  } else if (mainStack === "nestjs") {
    validationLibraries.push("class-validator");
  } else if (mainStack === "fastapi") {
    validationLibraries.push("pydantic");
  }

  const registry = await loadAWOSPlugins(workspaceRoot);
  let context: RepositoryContext = {
    stack: mainStack,
    architecture,
    modules: moduleBoundaries,
    testing,
    validation: {
      libraries: validationLibraries,
    },
    hash: manifestHash,
  };

  for (const analyzer of registry.analyzers) {
    try {
      const partial = await analyzer.detect(workspaceRoot);
      context = {
        ...context,
        ...partial,
        testing: {
          ...context.testing,
          ...(partial.testing || {}),
        },
        validation: {
          ...context.validation,
          ...(partial.validation || {}),
        },
      };
    } catch (err) {
      console.warn(`[AWOS Intelligence] Custom analyzer failed:`, err);
    }
  }

  return context;
}

/**
 * Loads the RepositoryContext, using cached results if valid.
 */
export async function getRepositoryContext(workspaceRoot: string): Promise<RepositoryContext> {
  const currentHash = await calculateManifestHash(workspaceRoot);
  const fullCachePath = path.join(workspaceRoot, CACHE_FILE);

  try {
    const cacheContent = await fs.readFile(fullCachePath, "utf8");
    const cachedCtx: RepositoryContext = JSON.parse(cacheContent);
    if (cachedCtx.hash === currentHash) {
      return cachedCtx;
    }
  } catch {
    // Cache miss or read failure
  }

  // Re-build and write to cache
  const context = await buildRepositoryContext(workspaceRoot);
  try {
    await fs.mkdir(path.dirname(fullCachePath), { recursive: true });
    await fs.writeFile(fullCachePath, JSON.stringify(context, null, 2), "utf8");
  } catch {
    // Non-blocking cache write failure
  }

  return context;
}
