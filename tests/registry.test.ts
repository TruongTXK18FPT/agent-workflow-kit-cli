/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { WorkflowRegistry, RoleRegistry } from "../src/core/awos/registry.js";
import { WorkflowDefinition, AgentRoleDefinition } from "../src/core/awos/types.js";

const TEMP_TEST_DIR = path.join(os.tmpdir(), "awk-test-registries");

const sampleRole: AgentRoleDefinition = {
  id: "test-backend-architect",
  name: "Backend Architect",
  description: "Responsible for microservices and domain logic",
  responsibilities: ["Design APIs", "Validate entities"],
  requiredInputs: ["domainModel"],
  expectedOutputs: ["javaCode"],
  validationChecklist: ["Linter passes", "Tests compile"],
  reviewChecklist: ["Approved by Senior Reviewer"],
};

const sampleWorkflow: WorkflowDefinition = {
  id: "test-code-review",
  name: "Code Review Pipeline",
  description: "Ensures styles and boundaries logic",
  version: "1.0.0",
  supportedArchitectures: ["clean-architecture"],
  requiredRoles: ["test-backend-architect"],
  graph: {
    id: "g1",
    name: "Subgraph",
    description: "Sub workflow description",
    version: "1.0.0",
    nodes: [
      { id: "s1", name: "Check code style", type: "task" },
      { id: "s2", name: "Report feedback", type: "task" },
    ],
    edges: [
      { sourceId: "s1", targetId: "s2" },
    ],
  },
};

describe("AWOS Workflow & Role Registries", () => {
  beforeAll(async () => {
    await fs.mkdir(path.join(TEMP_TEST_DIR, "workflows"), { recursive: true });
    await fs.mkdir(path.join(TEMP_TEST_DIR, "roles"), { recursive: true });

    // Write samples
    await fs.writeFile(
      path.join(TEMP_TEST_DIR, "workflows", "code-review.json"),
      JSON.stringify(sampleWorkflow, null, 2),
      "utf8"
    );
    await fs.writeFile(
      path.join(TEMP_TEST_DIR, "roles", "backend-architect.json"),
      JSON.stringify(sampleRole, null, 2),
      "utf8"
    );
  });

  afterAll(async () => {
    try {
      await fs.rm(TEMP_TEST_DIR, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  });

  it("should discover and load roles from role catalog registry", async () => {
    const rolesDir = path.join(TEMP_TEST_DIR, "roles");
    const discovered = await RoleRegistry.discover(rolesDir);
    expect(discovered.length).toBe(1);
    expect(discovered[0].id).toBe("test-backend-architect");

    const loaded = await RoleRegistry.load("test-backend-architect", rolesDir);
    expect(loaded.name).toBe("Backend Architect");
    expect(loaded.responsibilities).toContain("Design APIs");
  });

  it("should validate valid role schemas and throw on invalid ones", () => {
    expect(() => RoleRegistry.validate(sampleRole)).not.toThrow();
    
    const badRole: any = { id: "bad" };
    expect(() => RoleRegistry.validate(badRole)).toThrow(/Agent Role schema is invalid/);
  });

  it("should discover, load, and validate workflow packs", async () => {
    const wfDir = path.join(TEMP_TEST_DIR, "workflows");
    const discovered = await WorkflowRegistry.discover(wfDir);
    expect(discovered.length).toBe(1);
    expect(discovered[0].id).toBe("test-code-review");

    const loaded = await WorkflowRegistry.load("test-code-review", wfDir);
    expect(loaded.name).toBe("Code Review Pipeline");
    expect(loaded.graph.nodes.length).toBe(2);
  });

  it("should throw validation error on cyclic workflow pack graph", () => {
    const cyclicWorkflow: WorkflowDefinition = {
      ...sampleWorkflow,
      id: "cyclic-pack",
      graph: {
        id: "cyclic",
        name: "Cyclic Graph",
        description: "",
        version: "1.0.0",
        nodes: [
          { id: "a", name: "A", type: "task" },
          { id: "b", name: "B", type: "task" },
        ],
        edges: [
          { sourceId: "a", targetId: "b" },
          { sourceId: "b", targetId: "a" },
        ],
      },
    };

    expect(() => WorkflowRegistry.validate(cyclicWorkflow)).toThrow(/Cycle detected/);
  });
});
