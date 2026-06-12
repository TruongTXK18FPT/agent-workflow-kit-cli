import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import { parseImports } from "../src/core/parser.js";
import { WorkflowRuntime } from "../src/core/awos/runtime.js";
import { pluginRegistry, clearPluginsCache } from "../src/core/awos/registry.js";
import { clearConfigCache } from "../src/core/config.js";
import { runExport } from "../src/cli/commands/export.js";
import { loadProfile } from "../src/core/awos/profiles.js";

describe("Improvements Test Suite", () => {
  const tmpDir = path.join(process.cwd(), "temp_manual_tests");

  beforeEach(async () => {
    clearConfigCache();
    clearPluginsCache();
    await fs.mkdir(tmpDir, { recursive: true });
  });

  afterEach(async () => {
    clearConfigCache();
    clearPluginsCache();
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {}
  });

  describe("1. AST Parser integration", () => {
    it("should parse TS imports using compiler API", async () => {
      const tsCode = `
        import { foo } from "./foo";
        import * as bar from "bar";
        import("lazy-loaded");
      `;
      const imports = await parseImports("test.ts", tsCode);
      expect(imports).toContain("./foo");
      expect(imports).toContain("bar");
      expect(imports).toContain("lazy-loaded");
    });

    it("should parse Python imports ignoring comments and handle fallback", async () => {
      const pyCode = `
# This is a comment
import sys, os
from datetime import datetime
"""
import hidden_multiline
"""
      `;
      const imports = await parseImports("test.py", pyCode);
      expect(imports).toContain("sys");
      expect(imports).toContain("os");
      expect(imports).toContain("datetime");
      expect(imports).not.toContain("hidden_multiline");
    });

    it("should parse Java imports ignoring multi-line and single-line comments", async () => {
      const javaCode = `
        /*
         * import comment.block;
         */
        package com.example;
        import java.util.List; // single comment
        import static org.junit.Assert.assertEquals;
      `;
      const imports = await parseImports("Test.java", javaCode);
      expect(imports).toContain("java.util.List");
      expect(imports).toContain("org.junit.Assert.assertEquals");
      expect(imports).not.toContain("comment.block");
    });
  });

  describe("2. Workflow Runtime mockOutput support", () => {
    it("should use mockOutput during dry-run task execution", async () => {
      const graph: any = {
        id: "mock-dag",
        name: "Mock DAG",
        description: "Dry-run with mockOutput support",
        version: "1.0.0",
        nodes: [
          {
            id: "node1",
            name: "Mock Command Node",
            type: "task",
            executor: "command",
            params: { command: "echo original" },
            mockOutput: { stdout: "mocked response" },
          },
        ],
        edges: [],
      };

      const runtime = new WorkflowRuntime(tmpDir);
      const state = await runtime.run(graph, {}, { dryRun: true });
      expect(state.status).toBe("SUCCESS");
      expect(state.context.node1).toEqual({ stdout: "mocked response" });
    });
  });

  describe("3 & 4. Custom Templates and Plugins SDK", () => {
    it("should register custom profiles, analyzers, and executors", async () => {
      const mockAnalyzer = {
        name: "mock-analyzer",
        detect: async () => ({ stack: "mock-stack", architecture: "mock-arch" }),
      };

      const mockProfile = {
        name: "mock-profile",
        version: "1.0.0",
        folderStructure: [],
        reviewRules: { maxFileLines: 10, maxMethodLines: 2, requireInterfaceForServices: false },
        testingRequirements: { mustHaveTestFile: false, namingSuffix: "Test.ts" },
      };

      pluginRegistry.registerAnalyzer(mockAnalyzer);
      pluginRegistry.registerArchitectureProfile(mockProfile);

      const loaded = await loadProfile("mock-profile");
      expect(loaded.name).toBe("mock-profile");
      expect(loaded.reviewRules.maxFileLines).toBe(10);
    });
  });

  describe("5. Export Headless and File Output support", () => {
    it("should export to a custom file output if provided", async () => {
      const skillFileDir = path.join(tmpDir, ".agents", "skills", "test-skill");
      await fs.mkdir(skillFileDir, { recursive: true });
      await fs.writeFile(
        path.join(skillFileDir, "SKILL.md"),
        "---\nname: test-skill\ndescription: Test skill desc\n---\nSteps:\n1. Step 1",
        "utf8"
      );

      const oldCwd = process.cwd();
      process.chdir(tmpDir);
      try {
        const outFilePath = path.join(tmpDir, "exported.md");
        await runExport("antigravity", { clipboard: false, output: "exported.md" });

        const content = await fs.readFile(outFilePath, "utf8");
        expect(content).toContain("=== SKILL: test-skill ===");
        expect(content).toContain("Test skill desc");
      } finally {
        process.chdir(oldCwd);
      }
    });
  });
});
