/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { promises as fs } from "fs";
import path from "path";
import { WorkflowDefinition, AgentRoleDefinition } from "./types.js";
import { validateWorkflowGraph } from "./runtime.js";

/**
 * Registry for discovery, validation, and loading of reusable workflow graph definitions.
 */
export class WorkflowRegistry {
  /**
   * Scans a directory recursively for workflow JSON files.
   */
  public static async discover(dir: string): Promise<WorkflowDefinition[]> {
    const workflows: WorkflowDefinition[] = [];

    async function traverse(currentDir: string) {
      try {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);
          if (entry.isDirectory()) {
            if (
              entry.name.startsWith(".") ||
              entry.name === "node_modules" ||
              entry.name === "dist" ||
              entry.name === "build"
            ) {
              continue;
            }
            await traverse(fullPath);
          } else if (entry.isFile() && entry.name.endsWith(".json")) {
            try {
              const content = await fs.readFile(fullPath, "utf8");
              const parsed = JSON.parse(content);
              if (WorkflowRegistry.isValidSchema(parsed)) {
                // Perform graph cycles check
                validateWorkflowGraph(parsed.graph);
                workflows.push(parsed);
              }
            } catch {
              // Ignore invalid JSON files or validation failures during traversal
            }
          }
        }
      } catch {
        // Ignore read errors
      }
    }

    await traverse(dir);
    return workflows;
  }

  /**
   * Asserts schema validity for WorkflowDefinition.
   */
  public static isValidSchema(obj: any): obj is WorkflowDefinition {
    return (
      obj &&
      typeof obj.id === "string" &&
      typeof obj.name === "string" &&
      typeof obj.description === "string" &&
      typeof obj.version === "string" &&
      Array.isArray(obj.supportedArchitectures) &&
      Array.isArray(obj.requiredRoles) &&
      obj.graph &&
      Array.isArray(obj.graph.nodes) &&
      Array.isArray(obj.graph.edges)
    );
  }

  /**
   * Validates a workflow definition schema and graph.
   */
  public static validate(wf: WorkflowDefinition): void {
    if (!WorkflowRegistry.isValidSchema(wf)) {
      throw new Error("Workflow schema is invalid. Missing required fields: 'id', 'name', 'version', 'supportedArchitectures', 'requiredRoles', or 'graph'.");
    }
    // Check graph validity
    validateWorkflowGraph(wf.graph);
  }

  /**
   * Loads a specific workflow by ID.
   */
  public static async load(id: string, dir: string): Promise<WorkflowDefinition> {
    const list = await WorkflowRegistry.discover(dir);
    const matched = list.find((w) => w.id === id);
    if (!matched) {
      throw new Error(`Workflow Pack '${id}' not found under directory '${dir}'.`);
    }
    return matched;
  }
}

/**
 * Registry for discovery, validation, and loading of agent role profiles.
 */
export class RoleRegistry {
  /**
   * Scans a directory recursively for role JSON files.
   */
  public static async discover(dir: string): Promise<AgentRoleDefinition[]> {
    const roles: AgentRoleDefinition[] = [];

    async function traverse(currentDir: string) {
      try {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);
          if (entry.isDirectory()) {
            if (
              entry.name.startsWith(".") ||
              entry.name === "node_modules" ||
              entry.name === "dist" ||
              entry.name === "build"
            ) {
              continue;
            }
            await traverse(fullPath);
          } else if (entry.isFile() && entry.name.endsWith(".json")) {
            try {
              const content = await fs.readFile(fullPath, "utf8");
              const parsed = JSON.parse(content);
              if (RoleRegistry.isValidSchema(parsed)) {
                roles.push(parsed);
              }
            } catch {
              // Ignore invalid files
            }
          }
        }
      } catch {
        // Ignore read errors
      }
    }

    await traverse(dir);
    return roles;
  }

  /**
   * Asserts schema validity for AgentRoleDefinition.
   */
  public static isValidSchema(obj: any): obj is AgentRoleDefinition {
    return (
      obj &&
      typeof obj.id === "string" &&
      typeof obj.name === "string" &&
      typeof obj.description === "string" &&
      Array.isArray(obj.responsibilities) &&
      Array.isArray(obj.requiredInputs) &&
      Array.isArray(obj.expectedOutputs) &&
      Array.isArray(obj.validationChecklist) &&
      Array.isArray(obj.reviewChecklist)
    );
  }

  /**
   * Validates a role definition.
   */
  public static validate(role: AgentRoleDefinition): void {
    if (!RoleRegistry.isValidSchema(role)) {
      throw new Error("Agent Role schema is invalid. Missing required fields: 'id', 'name', 'responsibilities', 'requiredInputs', 'expectedOutputs', 'validationChecklist', or 'reviewChecklist'.");
    }
  }

  /**
   * Loads a specific role by ID.
   */
  public static async load(id: string, dir: string): Promise<AgentRoleDefinition> {
    const list = await RoleRegistry.discover(dir);
    const matched = list.find((r) => r.id === id);
    if (!matched) {
      throw new Error(`Agent Role '${id}' not found under directory '${dir}'.`);
    }
    return matched;
  }
}
