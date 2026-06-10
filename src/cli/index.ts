/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { Command } from "commander";
import chalk from "chalk";
import { runInit } from "./commands/init.js";
import { runSync } from "./commands/sync.js";
import { runDoctor } from "./commands/doctor.js";

const program = new Command();

export function runCli() {
  program
    .name("agent-workflow-kit")
    .description("Generate AI coding workflows/rules/templates for Codex and Antigravity")
    .version("1.0.0-mvp");

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
    .action(async () => {
      try {
        await runDoctor();
      } catch (err) {
        console.error(chalk.red(`Error running doctor: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
      }
    });

  program.parse(process.argv);
}
