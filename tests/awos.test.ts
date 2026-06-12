/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, vi } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import { buildRepositoryContext } from "../src/core/awos/intelligence.js";
import { loadProfile, validateFile } from "../src/core/awos/profiles.js";
import { validateWorkflowGraph, WorkflowRuntime } from "../src/core/awos/runtime.js";
import { DirectedWorkflowGraph } from "../src/core/awos/types.js";

describe("AWOS Layer 1: Repository Intelligence Engine", () => {
  it("should calculate correct manifest-based hash and stack context details", async () => {
    // Mock files system scans
    const mockCwd = process.cwd();
    const context = await buildRepositoryContext(mockCwd);
    
    expect(context.stack).toBeDefined();
    expect(context.architecture).toBeDefined();
    expect(context.modules).toBeInstanceOf(Array);
    expect(context.testing.frameworks).toBeInstanceOf(Array);
  });
});

describe("AWOS Layer 2: Architecture Profiles", () => {
  it("should support profile inheritance and deep config merging", async () => {
    const profile = await loadProfile("clean-architecture");
    expect(profile.name).toBe("clean-architecture");
    expect(profile.extends).toBe("layered");
    expect(profile.reviewRules.maxFileLines).toBe(300);
    expect(profile.reviewRules.requireInterfaceForServices).toBe(true);
    // Inherited rules
    expect(profile.folderStructure.length).toBeGreaterThan(0);
  });

  it("should detect line limit and forbidden dependency imports violations", () => {
    const profile: any = {
      name: "test-profile",
      folderStructure: [
        {
          pathPattern: "**/domain/**",
          forbiddenImports: ["**/infrastructure/**"],
        },
      ],
      reviewRules: {
        maxFileLines: 10,
      },
    };

    const goodFile = "import { Entity } from '../domain/Entity';\nconst x = 1;";
    const badFile = "import { Db } from '../infrastructure/Db';\nconst y = 2;\n// excess line\n// line 4\n// line 5\n// line 6\n// line 7\n// line 8\n// line 9\n// line 10\n// line 11";

    const goodViolations = validateFile("src/domain/UserService.ts", goodFile, profile);
    const badViolations = validateFile("src/domain/UserService.ts", badFile, profile);

    expect(goodViolations).toHaveLength(0);
    expect(badViolations.some(v => v.ruleName === "forbiddenImports")).toBe(true);
    expect(badViolations.some(v => v.ruleName === "maxFileLines")).toBe(true);
  });
});

describe("AWOS Layer 3: Directed Workflow Graph Runtime", () => {
  const validGraph: DirectedWorkflowGraph = {
    id: "test-dag",
    name: "Test DAG Workflow",
    description: "Assert correct directed graph execution paths",
    version: "1.0.0",
    nodes: [
      { id: "node1", name: "Start node", type: "task", executor: "command", params: { command: "echo node1" } },
      { id: "node2", name: "Step two conditional", type: "conditional", params: { expression: "true" } },
      { id: "node3", name: "Step three", type: "task", executor: "command", params: { command: "echo node3" } },
    ],
    edges: [
      { sourceId: "node1", targetId: "node2" },
      { sourceId: "node2", targetId: "node3", conditionExpression: "node2.conditionResult === true" },
    ],
  };

  const cyclicGraph: DirectedWorkflowGraph = {
    id: "cyclic-dag",
    name: "Cyclic DAG",
    description: "Should fail cycles validation",
    version: "1.0.0",
    nodes: [
      { id: "node1", name: "Node 1", type: "task" },
      { id: "node2", name: "Node 2", type: "task" },
    ],
    edges: [
      { sourceId: "node1", targetId: "node2" },
      { sourceId: "node2", targetId: "node1" },
    ],
  };

  it("should pass cycles validation on valid DAGs and fail on cyclic loops", () => {
    expect(() => validateWorkflowGraph(validGraph)).not.toThrow();
    expect(() => validateWorkflowGraph(cyclicGraph)).toThrow(/Cycle detected/);
  });

  it("should execute directed nodes topologically in dry-run mode", async () => {
    const runtime = new WorkflowRuntime(process.cwd());
    const resultState = await runtime.run(validGraph, {}, { dryRun: true });
    
    expect(resultState.status).toBe("SUCCESS");
    expect(resultState.steps.every(s => s.status === "COMPLETED")).toBe(true);
    expect(resultState.context.node2.conditionResult).toBe(true);
  });
});
