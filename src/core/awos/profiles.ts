/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { promises as fs } from "fs";
import path from "path";
import { ArchitectureProfile, FolderRule } from "./types.js";

export interface ArchitectureViolation {
  filePath: string;
  ruleName: string;
  message: string;
  severity: "error" | "warn";
}

// Built-in Profiles database fallback
const BUILTIN_PROFILES: Record<string, ArchitectureProfile> = {
  "layered": {
    name: "layered",
    version: "1.0.0",
    folderStructure: [
      {
        pathPattern: "**/controller/**",
        allowedImports: ["**/service/**", "**/dto/**", "**/model/**"],
        forbiddenImports: ["**/repository/**", "**/entity/**"],
      },
      {
        pathPattern: "**/service/**",
        allowedImports: ["**/repository/**", "**/dto/**", "**/model/**", "**/entity/**"],
        forbiddenImports: ["**/controller/**"],
      },
    ],
    reviewRules: {
      maxFileLines: 500,
      maxMethodLines: 50,
      requireInterfaceForServices: false,
    },
    testingRequirements: {
      mustHaveTestFile: false,
      namingSuffix: "Test.java",
    },
  },
  "clean-architecture": {
    name: "clean-architecture",
    version: "1.0.0",
    extends: "layered",
    folderStructure: [
      {
        pathPattern: "**/domain/**",
        allowedImports: [],
        forbiddenImports: ["**/infrastructure/**", "**/application/**", "**/presentation/**"],
      },
      {
        pathPattern: "**/application/**",
        allowedImports: ["**/domain/**"],
        forbiddenImports: ["**/infrastructure/**", "**/presentation/**"],
      },
    ],
    reviewRules: {
      maxFileLines: 300,
      maxMethodLines: 30,
      requireInterfaceForServices: true,
    },
    testingRequirements: {
      mustHaveTestFile: true,
      namingSuffix: "Test.java",
    },
  },
  "feature-first": {
    name: "feature-first",
    version: "1.0.0",
    folderStructure: [
      {
        pathPattern: "**/features/*/**",
        mustContainPatterns: ["components", "hooks", "index.ts"],
      },
    ],
    reviewRules: {
      maxFileLines: 400,
      maxMethodLines: 40,
      requireInterfaceForServices: false,
    },
    testingRequirements: {
      mustHaveTestFile: true,
      namingSuffix: ".test.ts",
    },
  },
};

/**
 * Deep merges two architecture profiles for inheritance resolving.
 */
export function mergeProfiles(base: ArchitectureProfile, extension: ArchitectureProfile): ArchitectureProfile {
  return {
    name: extension.name,
    version: extension.version,
    extends: extension.extends,
    folderStructure: [...(base.folderStructure || []), ...(extension.folderStructure || [])],
    reviewRules: {
      ...base.reviewRules,
      ...extension.reviewRules,
    },
    testingRequirements: {
      ...base.testingRequirements,
      ...extension.testingRequirements,
    },
  };
}

/**
 * Loads a profile by name from disk or built-in registry.
 */
export async function loadProfile(
  profileName: string,
  profilesDir?: string
): Promise<ArchitectureProfile> {
  let profile = BUILTIN_PROFILES[profileName];

  if (profilesDir) {
    try {
      const customPath = path.join(profilesDir, `${profileName}.json`);
      const fileContent = await fs.readFile(customPath, "utf8");
      profile = JSON.parse(fileContent);
    } catch {
      // Fallback to built-in if file read fails
    }
  }

  if (!profile) {
    throw new Error(`Architecture Profile '${profileName}' not found.`);
  }

  if (profile.extends) {
    const parentProfile = await loadProfile(profile.extends, profilesDir);
    return mergeProfiles(parentProfile, profile);
  }

  return profile;
}

/**
 * Matches glob-ish path patterns. Simple helper.
 */
function matchPathPattern(filePath: string, pattern: string): boolean {
  // Translate simple **/ pattern to regex
  const regexString = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape regex specials
    .replace(/\*\*/g, ".*")
    .replace(/\*/g, "[^/]*");
  const regex = new RegExp(`^${regexString}$|^${regexString}`);
  return regex.test(filePath.replace(/\\/g, "/"));
}

/**
 * Validates a single file content and path against architectural rules.
 */
export function validateFile(
  filePath: string,
  content: string,
  profile: ArchitectureProfile
): ArchitectureViolation[] {
  const violations: ArchitectureViolation[] = [];
  const relativePath = filePath.replace(/\\/g, "/");

  // 1. Line limits check
  const lines = content.split("\n");
  if (lines.length > profile.reviewRules.maxFileLines) {
    violations.push({
      filePath,
      ruleName: "maxFileLines",
      message: `File has ${lines.length} lines, exceeding the limit of ${profile.reviewRules.maxFileLines}.`,
      severity: "error",
    });
  }

  // 2. Folder structures and imports validation
  for (const rule of profile.folderStructure) {
    if (matchPathPattern(relativePath, rule.pathPattern)) {
      // Check imports
      if (rule.forbiddenImports || rule.allowedImports) {
        // Find imports in file using standard regexes
        const importsMatches = content.matchAll(
          /(?:import\s+[\s\S]*?from\s+['"]([^'"]+)['"])|(?:import\s+([a-zA-Z0-9._]+);)/g
        );

        for (const match of importsMatches) {
          const importedRef = match[1] || match[2];
          if (!importedRef) continue;

          // Forbidden check
          if (rule.forbiddenImports) {
            for (const forbidden of rule.forbiddenImports) {
              if (matchPathPattern(importedRef, forbidden)) {
                violations.push({
                  filePath,
                  ruleName: "forbiddenImports",
                  message: `Importing '${importedRef}' is forbidden in '${rule.pathPattern}'.`,
                  severity: "error",
                });
              }
            }
          }

          // Allowed check (if specified, anything not matched is forbidden)
          if (rule.allowedImports && rule.allowedImports.length > 0) {
            let isAllowed = false;
            // Also allow standard library / node modules
            if (!importedRef.startsWith(".") && !importedRef.startsWith("/") && !importedRef.includes("/")) {
              isAllowed = true;
            } else {
              for (const allowed of rule.allowedImports) {
                if (matchPathPattern(importedRef, allowed)) {
                  isAllowed = true;
                  break;
                }
              }
            }

            if (!isAllowed) {
              violations.push({
                filePath,
                ruleName: "allowedImports",
                message: `Importing '${importedRef}' is not explicitly allowed in '${rule.pathPattern}'.`,
                severity: "error",
              });
            }
          }
        }
      }

      // Check required patterns
      if (rule.mustContainPatterns) {
        for (const pattern of rule.mustContainPatterns) {
          if (!content.includes(pattern)) {
            violations.push({
              filePath,
              ruleName: "mustContainPatterns",
              message: `File must contain pattern: '${pattern}'.`,
              severity: "warn",
            });
          }
        }
      }
    }
  }

  return violations;
}

/**
 * Scans workspace and validates all source files against the ArchitectureProfile.
 */
export async function validateArchitecture(
  workspaceRoot: string,
  profile: ArchitectureProfile
): Promise<ArchitectureViolation[]> {
  const violations: ArchitectureViolation[] = [];

  async function traverse(dir: string) {
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
          await traverse(fullPath);
        } else if (entry.isFile() && /\.(ts|tsx|java|py)$/.test(entry.name)) {
          // Avoid validating test files for structure limits
          const isTest = entry.name.endsWith(profile.testingRequirements.namingSuffix);
          const content = await fs.readFile(fullPath, "utf8");

          if (!isTest) {
            const fileViolations = validateFile(fullPath, content, profile);
            violations.push(...fileViolations);

            // Verify test file existence if required
            if (profile.testingRequirements.mustHaveTestFile) {
              const ext = path.extname(entry.name);
              const baseName = path.basename(entry.name, ext);
              const testFileName = baseName + profile.testingRequirements.namingSuffix;
              const testPath = path.join(dir, testFileName);
              try {
                await fs.stat(testPath);
              } catch {
                violations.push({
                  filePath: fullPath,
                  ruleName: "mustHaveTestFile",
                  message: `Missing matching test file: '${testFileName}' expected in the same directory.`,
                  severity: "warn",
                });
              }
            }
          }
        }
      }
    } catch {
      // Ignore read errors
    }
  }

  await traverse(workspaceRoot);
  return violations;
}
