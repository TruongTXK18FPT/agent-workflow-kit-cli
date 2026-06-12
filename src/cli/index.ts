/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { Command } from "commander";
import chalk from "chalk";
import { runInit } from "./commands/init.js";
import { runAdd } from "./commands/add.js";
import { runSync } from "./commands/sync.js";
import { runDoctor } from "./commands/doctor.js";
import { runExport } from "./commands/export.js";
import { runWorkflowCommand, resumeWorkflowCommand } from "./commands/run.js";
import { runProfileCheck } from "./commands/profile.js";
import { listWorkflows, showWorkflow, validateWorkflow, runWorkflowById } from "./commands/workflow.js";
import { listRoles, showRole, validateRoles } from "./commands/role.js";
import { createAdrCommand, listAdrsCommand, showAdrCommand, searchAdrsCommand } from "./commands/adr.js";

const program = new Command();

export function runCli() {
  program
    .name("agent-workflow-kit")
    .description("Generate AI coding workflows/rules/templates for Codex and Antigravity")
    .version("1.3.1");

  program
    .command("init")
    .description("Initialize agent guidelines and skills for the repository")
    .option("--stack <stack>", "Specify target stack: auto | spring-boot | react-ts | fastapi", "auto")
    .option("--agent <agent>", "Specify target agent profile: both | codex | antigravity", "both")
    .option("--dry-run", "Output actions to console without writing any files", false)
    .action(async (options) => {
      try {
        await runInit(options);
      } catch (err) {
        console.error(chalk.red(`Error running init: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    });

  program
    .command("add <stack>")
    .description("Manually add/install a stack pack to a specific folder")
    .option("--path <path>", "Target folder path to install the guidelines", ".")
    .option("--agent <agent>", "Specify target agent profile: both | codex | antigravity", "both")
    .option("--dry-run", "Output actions to console without writing any files", false)
    .action(async (stack, options) => {
      try {
        await runAdd(stack, options);
      } catch (err) {
        console.error(chalk.red(`Error running add: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    });

  program
    .command("sync")
    .description("Sync generated guidelines and skills inside managed blocks")
    .option("--dry-run", "Output changes to console without saving", false)
    .action(async (options) => {
      try {
        await runSync(options);
      } catch (err) {
        console.error(chalk.red(`Error running sync: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    });

  program
    .command("doctor")
    .description("Verify active agent configurations, environment, and run validation tests")
    .option("--install-hook", "Install a git pre-commit hook to automatically run doctor checks", false)
    .action(async (options) => {
      try {
        await runDoctor(options);
      } catch (err) {
        console.error(chalk.red(`Error running doctor: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    });

  program
    .command("export <target>")
    .description("Export custom workflows/skills for the target agent (e.g., 'antigravity')")
    .option("--no-clipboard", "Do not copy the exported instructions to clipboard", false)
    .option("-o, --output <file>", "Write the exported guidelines to a specific file")
    .action(async (target, options) => {
      try {
        await runExport(target, { clipboard: options.clipboard, output: options.output });
      } catch (err) {
        console.error(chalk.red(`Error running export: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    });

  program
    .command("run <workflow>")
    .description("Execute an AWOS graph workflow")
    .option("--inputs <inputs>", "Path to input JSON file or inline JSON string")
    .option("--dry-run", "Execute workflow steps in simulation mode", false)
    .action(async (workflow, options) => {
      try {
        await runWorkflowCommand(workflow, options);
      } catch (err) {
        console.error(chalk.red(`Error running workflow: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    });

  program
    .command("resume <runId>")
    .description("Resume a suspended AWOS workflow")
    .action(async (runId) => {
      try {
        await resumeWorkflowCommand(runId);
      } catch (err) {
        console.error(chalk.red(`Error resuming workflow: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    });

  program
    .command("profile")
    .description("Validate directory architecture structure and rules boundaries")
    .option("--profile <profile>", "Target profile name (e.g. clean-architecture)")
    .action(async (options) => {
      try {
        await runProfileCheck(options);
      } catch (err) {
        console.error(chalk.red(`Error validation profile rules: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    });

  // --- Workflow Group Subcommands ---
  const workflowCmd = program.command("workflow").description("Manage and execute AWOS workflow packs");

  workflowCmd
    .command("list")
    .description("List discovered workflow packs")
    .action(async () => {
      try {
        await listWorkflows();
      } catch (err) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    });

  workflowCmd
    .command("show <id>")
    .description("Show workflow pack steps and metadata")
    .action(async (id) => {
      try {
        await showWorkflow(id);
      } catch (err) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    });

  workflowCmd
    .command("validate <id>")
    .description("Validate a workflow pack schema and graph cyclic constraints")
    .action(async (id) => {
      try {
        await validateWorkflow(id);
      } catch (err) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    });

  workflowCmd
    .command("run <id>")
    .description("Run a registered workflow pack by ID")
    .option("--inputs <inputs>", "Path to inputs parameter JSON file or inline string")
    .option("--dry-run", "Run nodes in dry-run mode", false)
    .action(async (id, options) => {
      try {
        await runWorkflowById(id, options);
      } catch (err) {
        console.error(chalk.red(`Error running workflow: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    });

  // --- Role Group Subcommands ---
  const roleCmd = program.command("role").description("Manage agent role profiles");

  roleCmd
    .command("list")
    .description("List all discovered role profiles in catalog")
    .action(async () => {
      try {
        await listRoles();
      } catch (err) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    });

  roleCmd
    .command("show <id>")
    .description("Show agent role details, checklists and inputs schema")
    .action(async (id) => {
      try {
        await showRole(id);
      } catch (err) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    });

  roleCmd
    .command("validate")
    .description("Validate all roles catalog files schema parameters")
    .action(async () => {
      try {
        await validateRoles();
      } catch (err) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    });

  // --- ADR Group Subcommands ---
  const adrCmd = program.command("adr").description("Manage Architectural Decision Records");

  adrCmd
    .command("create")
    .description("Create a new numbered architectural decision record (ADR)")
    .option("--title <title>", "ADR decision title")
    .option("--status <status>", "Initial status: proposed | accepted | rejected | superseded", "proposed")
    .option("--context <context>", "Context background explanation")
    .option("--decision <decision>", "Architectural decision detail statement")
    .option("--consequences <consequences>", "Repercussions of decision taken")
    .option("--decision-maker <maker>", "Role or name of decider", "AWOS System")
    .action(async (options) => {
      try {
        await createAdrCommand(options);
      } catch (err) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    });

  adrCmd
    .command("list")
    .description("List all saved ADR documents")
    .action(async () => {
      try {
        await listAdrsCommand();
      } catch (err) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    });

  adrCmd
    .command("show <id>")
    .description("Display details of a numbered ADR document")
    .action(async (id) => {
      try {
        await showAdrCommand(id);
      } catch (err) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    });

  adrCmd
    .command("search <keyword>")
    .description("Search all ADR documents for keyword text matches")
    .action(async (keyword) => {
      try {
        await searchAdrsCommand(keyword);
      } catch (err) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    });

  program.parse(process.argv);
}
