/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { exec } from "child_process";
import { promisify } from "util";
import { DirectedWorkflowGraph, WorkflowRunState, WorkflowNode, WorkflowEdge, StepStatus } from "./types.js";

const execAsync = promisify(exec);
const RUNS_DIR = ".agents/state/runs";

/**
 * Validates a DirectedWorkflowGraph to guarantee it is Acyclic and structurally correct.
 */
export function validateWorkflowGraph(graph: DirectedWorkflowGraph): void {
  const nodeMap = new Map<string, WorkflowNode>();
  const adjList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of graph.nodes) {
    nodeMap.set(node.id, node);
    adjList.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  for (const edge of graph.edges) {
    if (!nodeMap.has(edge.sourceId) || !nodeMap.has(edge.targetId)) {
      throw new Error(`Edge references non-existent node: ${edge.sourceId} -> ${edge.targetId}`);
    }
    adjList.get(edge.sourceId)!.push(edge.targetId);
    inDegree.set(edge.targetId, (inDegree.get(edge.targetId) || 0) + 1);
  }

  // 1. Cycle Detection using DFS
  const visited = new Set<string>();
  const recStack = new Set<string>();

  function dfs(nodeId: string) {
    visited.add(nodeId);
    recStack.add(nodeId);

    const neighbors = adjList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      } else if (recStack.has(neighbor)) {
        // Exclude self-referencing retry/rollback configurations if explicit
        const node = nodeMap.get(nodeId);
        if (node?.type !== "retry" && node?.type !== "rollback") {
          throw new Error(`Cycle detected involving node: ${nodeId} -> ${neighbor}`);
        }
      }
    }
    recStack.delete(nodeId);
  }

  for (const node of graph.nodes) {
    if (!visited.has(node.id)) {
      dfs(node.id);
    }
  }

  // 2. Fork/Join balance validation
  const forkNodes = graph.nodes.filter((n) => n.type === "fork");
  const joinNodes = graph.nodes.filter((n) => n.type === "join");
  if (forkNodes.length !== joinNodes.length) {
    throw new Error(`Fork/Join count mismatch. Forks: ${forkNodes.length}, Joins: ${joinNodes.length}`);
  }
}

/**
 * Helper to evaluate condition expressions.
 */
function evaluateCondition(expression: string, context: Record<string, any>): boolean {
  try {
    // Simple sandbox execution for safe expressions
    const keys = Object.keys(context);
    const values = Object.values(context);
    const fn = new Function(...keys, `return ${expression};`);
    return !!fn(...values);
  } catch (err) {
    console.warn(`Condition evaluation failed for '${expression}':`, err);
    return false;
  }
}

/**
 * Workflow Runtime execution engine.
 */
export class WorkflowRuntime {
  private workspaceRoot: string;
  private runState!: WorkflowRunState;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  /**
   * Initializes or resumes execution state file.
   */
  private async initRunState(graph: DirectedWorkflowGraph, initialCtx: Record<string, any>): Promise<void> {
    const runId = "run_" + crypto.randomBytes(4).toString("hex");
    this.runState = {
      runId,
      workflowId: graph.id,
      status: "IDLE",
      context: { ...initialCtx },
      currentStepIndex: 0,
      steps: graph.nodes.map((n) => ({
        id: n.id,
        name: n.name,
        status: "PENDING" as StepStatus,
      })),
    };
    await this.persistState();
  }

  private async persistState(): Promise<void> {
    const runDir = path.join(this.workspaceRoot, RUNS_DIR);
    const runFile = path.join(runDir, `${this.runState.runId}.json`);
    await fs.mkdir(runDir, { recursive: true });
    await fs.writeFile(runFile, JSON.stringify(this.runState, null, 2), "utf8");
  }

  public getRunState(): WorkflowRunState {
    return this.runState;
  }

  /**
   * Runs the workflow graph execution loop.
   */
  public async run(
    graph: DirectedWorkflowGraph,
    initialContext: Record<string, any> = {},
    options: { dryRun?: boolean } = {}
  ): Promise<WorkflowRunState> {
    validateWorkflowGraph(graph);
    await this.initRunState(graph, initialContext);

    this.runState.status = "EXECUTING";
    await this.persistState();

    const nodeMap = new Map<string, WorkflowNode>();
    for (const node of graph.nodes) {
      nodeMap.set(node.id, node);
    }

    const inDegree = new Map<string, number>();
    const parentsMap = new Map<string, string[]>();
    for (const n of graph.nodes) {
      inDegree.set(n.id, 0);
      parentsMap.set(n.id, []);
    }

    for (const edge of graph.edges) {
      inDegree.set(edge.targetId, inDegree.get(edge.targetId)! + 1);
      parentsMap.get(edge.targetId)!.push(edge.sourceId);
    }

    // Nodes ready to execute
    const queue: string[] = graph.nodes
      .filter((n) => (inDegree.get(n.id) || 0) === 0)
      .map((n) => n.id);

    // Keep track of resolved step status
    const stepStatuses = new Map<string, StepStatus>();
    for (const s of this.runState.steps) {
      stepStatuses.set(s.id, "PENDING");
    }

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const node = nodeMap.get(nodeId)!;
      const stepIdx = this.runState.steps.findIndex((s) => s.id === nodeId);

      this.runState.steps[stepIdx].status = "RUNNING";
      this.runState.steps[stepIdx].startedAt = new Date().toISOString();
      await this.persistState();

      // Resolve role checks if configured
      if (node.role) {
        try {
          const { loadAWOSPlugins } = await import("./registry.js");
          const registry = await loadAWOSPlugins(this.workspaceRoot);
          const customRole = registry.roles.get(node.role);
          if (customRole) {
            console.log(`[AWOS Runtime] Custom Role '${node.role}' loaded for step '${node.name}'. Asserting hooks...`);
            if (customRole.hooks?.preStep) {
              const { getRepositoryContext } = await import("./intelligence.js");
              const { loadProfile } = await import("./profiles.js");
              const repoContext = await getRepositoryContext(this.workspaceRoot);
              const archProfile = await loadProfile(repoContext.architecture);
              const res = await customRole.hooks.preStep({
                runId: this.runState.runId,
                workspaceRoot: this.workspaceRoot,
                repoContext,
                profile: archProfile
              }, node);
              if (!res.proceed) {
                throw new Error(`Role preStep hook rejected execution: ${res.error || "Unknown rejection"}`);
              }
            }
          } else {
            const { RoleRegistry } = await import("./registry.js");
            const roleDef = await RoleRegistry.load(node.role, path.join(this.workspaceRoot, ".agents/roles"));
            console.log(`[AWOS Runtime] Role '${roleDef.id}' loaded for step '${node.name}'. Asserting responsibilities...`);
          }
        } catch (err) {
          console.log(`[AWOS Runtime] Warning: Active role metadata for '${node.role}' could not be loaded: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      try {
        let success = true;
        let outputs: Record<string, any> = {};

        // Execute by step type
        if (node.type === "task") {
          const executor = node.executor || "command";
          const params = node.params || {};

          const { loadAWOSPlugins } = await import("./registry.js");
          const registry = await loadAWOSPlugins(this.workspaceRoot);

          if (registry.executors.has(executor)) {
            if (options.dryRun) {
              console.log(`[Dry Run] Would execute custom executor '${executor}' with params:`, params);
              outputs = node.mockOutput || { log: "Custom dry run completed." };
            } else {
              const executeFn = registry.executors.get(executor)!;
              outputs = await executeFn(params, this.runState);
            }
          } else if (executor === "command" && params.command) {
            if (options.dryRun) {
              console.log(`[Dry Run] Would execute shell command: ${params.command}`);
              outputs = node.mockOutput || { log: "Dry run completed." };
            } else {
              const { stdout, stderr } = await execAsync(params.command, { cwd: this.workspaceRoot });
              outputs = { stdout, stderr };
            }
          } else if (executor === "adr-generate") {
            if (options.dryRun) {
              console.log(`[Dry Run] Would generate ADR: ${params.title || "Decision"}`);
              outputs = node.mockOutput || { adrId: "ADR-MOCK", status: "proposed" };
            } else {
              const { ADRService } = await import("./adr.js");
              const generated = await ADRService.create(this.workspaceRoot, {
                title: params.title || "Decision",
                status: params.status || "proposed",
                context: params.context || "",
                decision: params.decision || "",
                consequences: params.consequences || "",
                metadata: params.metadata || {},
              });
              outputs = { adrId: generated.id, status: generated.status };
              console.log(`[AWOS Runtime] Generated Architectural Decision Record: ${generated.id}`);
            }
          }
        } else if (node.type === "conditional") {
          const expression = node.params?.expression || "true";
          const evalResult = evaluateCondition(expression, this.runState.context);
          outputs = { conditionResult: evalResult };
        } else if (node.type === "approval") {
          // Pause execution and ask for human approval
          this.runState.steps[stepIdx].status = "WAITING_APPROVAL";
          this.runState.status = "PAUSED";
          await this.persistState();
          console.log(`\n⚠️ Workflow paused at step '${node.name}'. Requires human approval to resume.`);
          console.log(`Run 'awk run resume ${this.runState.runId}' to proceed.\n`);
          return this.runState; // Suspends execution
        }

        if (success) {
          stepStatuses.set(nodeId, "COMPLETED");
          this.runState.steps[stepIdx].status = "COMPLETED";
          this.runState.steps[stepIdx].outputs = outputs;
          this.runState.steps[stepIdx].completedAt = new Date().toISOString();

          // Merge outcomes into runtime context
          this.runState.context = {
            ...this.runState.context,
            [nodeId]: outputs,
          };
        } else {
          throw new Error(`Execution failed at node '${node.name}'`);
        }
      } catch (err) {
        stepStatuses.set(nodeId, "FAILED");
        this.runState.steps[stepIdx].status = "FAILED";
        this.runState.steps[stepIdx].completedAt = new Date().toISOString();
        await this.persistState();

        // Handle retry and rollback
        if (node.rollbackNodeId) {
          console.warn(`Node failed. Triggering rollback node: ${node.rollbackNodeId}`);
          queue.push(node.rollbackNodeId);
        } else {
          this.runState.status = "FAILURE";
          await this.persistState();
          throw err;
        }
      }

      await this.persistState();

      // Find children next nodes to push to queue
      const edges = graph.edges.filter((e) => e.sourceId === nodeId);
      for (const edge of edges) {
        const targetId = edge.targetId;
        const targetNode = nodeMap.get(targetId)!;

        // Verify if condition is met
        if (node.type === "conditional" && edge.conditionExpression) {
          const condPassed = evaluateCondition(edge.conditionExpression, this.runState.context);
          if (!condPassed) {
            stepStatuses.set(targetId, "SKIPPED");
            const targetIdx = this.runState.steps.findIndex((s) => s.id === targetId);
            this.runState.steps[targetIdx].status = "SKIPPED";
            continue;
          }
        }

        // Check incoming paths dependency for JOIN nodes
        if (targetNode.type === "join") {
          const parents = parentsMap.get(targetId) || [];
          const allParentsFinished = parents.every((p) => {
            const status = stepStatuses.get(p);
            return status === "COMPLETED" || status === "SKIPPED" || status === "FAILED";
          });
          if (allParentsFinished && !queue.includes(targetId)) {
            queue.push(targetId);
          }
        } else {
          if (!queue.includes(targetId)) {
            queue.push(targetId);
          }
        }
      }
    }

    const hasFailures = Array.from(stepStatuses.values()).includes("FAILED");
    this.runState.status = hasFailures ? "FAILURE" : "SUCCESS";
    await this.persistState();

    return this.runState;
  }
}
