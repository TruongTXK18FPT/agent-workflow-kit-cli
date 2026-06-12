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

const program = new Command();

export function runCli() {
  program
    .name("agent-workflow-kit")
    .description("Generate AI coding workflows/rules/templates for Codex and Antigravity")
    .version("1.2.0");

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
    .action(async (target, options) => {
      try {
        await runExport(target, { clipboard: options.clipboard });
      } catch (err) {
        console.error(chalk.red(`Error running export: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    });

  program.parse(process.argv);
}
