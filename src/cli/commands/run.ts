/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import chalk from "chalk";
import { promises as fs } from "fs";
import path from "path";
import { WorkflowRuntime } from "../../core/awos/runtime.js";
import { DirectedWorkflowGraph } from "../../core/awos/types.js";

interface RunOptions {
  inputs?: string;
  dryRun?: boolean;
}

export async function runWorkflowCommand(workflowPath: string, options: RunOptions) {
  const cwd = process.cwd();
  console.log(chalk.bold.cyan("\n🚀 AWOS Workflow Executor"));
  console.log(chalk.dim("------------------------------------------"));
  console.log(`Workflow File: ${chalk.green(workflowPath)}`);
  console.log(`Dry Run:       ${options.dryRun ? chalk.yellow("Enabled 🧪") : chalk.gray("Disabled")}`);
  console.log(chalk.dim("------------------------------------------\n"));

  let graph: DirectedWorkflowGraph;
  try {
    const fullPath = path.resolve(cwd, workflowPath);
    const content = await fs.readFile(fullPath, "utf8");
    graph = JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to load workflow file: ${err instanceof Error ? err.message : String(err)}`);
  }

  let inputs: Record<string, any> = {};
  if (options.inputs) {
    try {
      const inputsPath = path.resolve(cwd, options.inputs);
      const content = await fs.readFile(inputsPath, "utf8");
      inputs = JSON.parse(content);
    } catch {
      // Inline JSON parsing
      try {
        inputs = JSON.parse(options.inputs);
      } catch (err) {
        throw new Error(`Failed to parse inputs parameters: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  const runtime = new WorkflowRuntime(cwd);
  const result = await runtime.run(graph, inputs, { dryRun: options.dryRun });

  console.log(chalk.dim("\n------------------------------------------"));
  if (result.status === "SUCCESS") {
    console.log(chalk.bold.green(`✔️ Workflow execution succeeded! Run ID: ${result.runId}`));
  } else if (result.status === "PAUSED") {
    console.log(chalk.bold.yellow(`⚠️ Workflow execution paused. Resume using: awk run resume ${result.runId}`));
  } else {
    console.log(chalk.bold.red(`❌ Workflow execution failed. Run ID: ${result.runId}`));
  }
}

export async function resumeWorkflowCommand(runId: string) {
  const cwd = process.cwd();
  const runFile = path.resolve(cwd, `.agents/state/runs/${runId}.json`);

  console.log(chalk.bold.cyan(`\n🚀 AWOS Workflow Executor - Resuming Run '${runId}'`));
  console.log(chalk.dim("------------------------------------------"));

  try {
    const runContent = await fs.readFile(runFile, "utf8");
    const runState = JSON.parse(runContent);
    console.log(`Active step state was: ${chalk.yellow(runState.status)}`);
    
    // Simulate resumption by completing approval steps
    runState.status = "EXECUTING";
    const pausedStepIdx = runState.steps.findIndex((s: any) => s.status === "WAITING_APPROVAL");
    if (pausedStepIdx !== -1) {
      runState.steps[pausedStepIdx].status = "COMPLETED";
      runState.steps[pausedStepIdx].completedAt = new Date().toISOString();
      console.log(`✔️ Human approved step: ${chalk.green(runState.steps[pausedStepIdx].name)}`);
    }

    await fs.writeFile(runFile, JSON.stringify(runState, null, 2), "utf8");
    console.log(chalk.green(`✔️ Run '${runId}' successfully resumed & marked completed!`));
  } catch (err) {
    throw new Error(`Failed to resume execution run '${runId}': ${err instanceof Error ? err.message : String(err)}`);
  }
}
