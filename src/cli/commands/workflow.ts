/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import chalk from "chalk";
import { promises as fs } from "fs";
import path from "path";
import { WorkflowRegistry } from "../../core/awos/registry.js";
import { WorkflowRuntime } from "../../core/awos/runtime.js";

const DEFAULT_WORKFLOW_DIR = ".agents/workflows";

export async function listWorkflows() {
  const cwd = process.cwd();
  console.log(chalk.bold.cyan("\n📋 Discovered AWOS Workflow Packs"));
  console.log(chalk.dim("------------------------------------------"));

  const dir = path.join(cwd, DEFAULT_WORKFLOW_DIR);
  const list = await WorkflowRegistry.discover(dir);

  if (list.length === 0) {
    console.log(chalk.gray(`No workflows found under '${DEFAULT_WORKFLOW_DIR}/'.`));
    return;
  }

  for (const wf of list) {
    console.log(`${chalk.bold.green(`- ${wf.id}`)} v${wf.version} : ${wf.name}`);
    console.log(chalk.gray(`  ${wf.description}`));
    console.log(chalk.gray(`  Roles: ${wf.requiredRoles.join(", ")} | Architectures: ${wf.supportedArchitectures.join(", ")}\n`));
  }
}

export async function showWorkflow(id: string) {
  const cwd = process.cwd();
  const dir = path.join(cwd, DEFAULT_WORKFLOW_DIR);
  const wf = await WorkflowRegistry.load(id, dir);

  console.log(chalk.bold.cyan(`\n🔍 Workflow Details: ${wf.id}`));
  console.log(chalk.dim("------------------------------------------"));
  console.log(`${chalk.bold("Name:")}        ${wf.name}`);
  console.log(`${chalk.bold("Version:")}     ${wf.version}`);
  console.log(`${chalk.bold("Description:")} ${wf.description}`);
  console.log(`${chalk.bold("Architectures:")} ${wf.supportedArchitectures.join(", ")}`);
  console.log(`${chalk.bold("Required Roles:")} ${wf.requiredRoles.join(", ")}`);
  console.log(chalk.dim("------------------------------------------"));
  console.log(chalk.bold("Graph Execution Steps:"));
  for (const node of wf.graph.nodes) {
    const roleStr = node.role ? ` (Role: ${node.role})` : "";
    const execStr = node.executor ? ` [Executor: ${node.executor}]` : "";
    console.log(`  - [${node.type.toUpperCase()}] ${chalk.green(node.id)}: "${node.name}"${roleStr}${execStr}`);
  }
  console.log(chalk.dim("------------------------------------------\n"));
}

export async function validateWorkflow(id: string) {
  const cwd = process.cwd();
  const dir = path.join(cwd, DEFAULT_WORKFLOW_DIR);
  
  try {
    const wf = await WorkflowRegistry.load(id, dir);
    WorkflowRegistry.validate(wf);
    console.log(chalk.bold.green(`\n✔️ Workflow '${id}' is structurally valid and acyclic!`));
  } catch (err) {
    console.error(chalk.bold.red(`\n❌ Workflow '${id}' is invalid:`));
    console.error(chalk.red(`  ${err instanceof Error ? err.message : String(err)}`));
    process.exit(1);
  }
}

export async function runWorkflowById(id: string, options: { inputs?: string; dryRun?: boolean }) {
  const cwd = process.cwd();
  const dir = path.join(cwd, DEFAULT_WORKFLOW_DIR);
  
  const wf = await WorkflowRegistry.load(id, dir);
  
  let inputs: Record<string, any> = {};
  if (options.inputs) {
    try {
      const inputsPath = path.resolve(cwd, options.inputs);
      const content = await fs.readFile(inputsPath, "utf8");
      inputs = JSON.parse(content);
    } catch {
      try {
        inputs = JSON.parse(options.inputs);
      } catch (err) {
        throw new Error(`Failed to parse inputs parameters: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  console.log(chalk.bold.cyan(`\n🚀 Executing Discovered Workflow: ${wf.id}`));
  console.log(chalk.dim("------------------------------------------"));

  const runtime = new WorkflowRuntime(cwd);
  const result = await runtime.run(wf.graph, inputs, { dryRun: options.dryRun });

  console.log(chalk.dim("\n------------------------------------------"));
  if (result.status === "SUCCESS") {
    console.log(chalk.bold.green(`✔️ Workflow execution succeeded! Run ID: ${result.runId}`));
  } else if (result.status === "PAUSED") {
    console.log(chalk.bold.yellow(`⚠️ Workflow execution paused. Resume using: awk resume ${result.runId}`));
  } else {
    console.log(chalk.bold.red(`❌ Workflow execution failed. Run ID: ${result.runId}`));
  }
}
