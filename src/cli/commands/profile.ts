/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import chalk from "chalk";
import { getRepositoryContext } from "../../core/awos/intelligence.js";
import { loadProfile, validateArchitecture } from "../../core/awos/profiles.js";

interface ProfileOptions {
  profile?: string;
}

export async function runProfileCheck(options: ProfileOptions) {
  const cwd = process.cwd();
  console.log(chalk.bold.cyan("\n🔎 AWOS Architecture Profile Linter"));
  console.log(chalk.dim("------------------------------------------"));

  const context = await getRepositoryContext(cwd);
  const targetProfileName = options.profile || context.architecture;

  console.log(`Target Profile: ${chalk.green(targetProfileName)} (detected from ${chalk.yellow(context.stack)})`);
  console.log(chalk.dim("------------------------------------------\n"));

  try {
    const profile = await loadProfile(targetProfileName);
    console.log(chalk.gray("Scanning workspace files for structural rules constraints..."));
    
    const violations = await validateArchitecture(cwd, profile);
    
    if (violations.length === 0) {
      console.log(chalk.bold.green("\n🎉 Congratulations! Zero architecture or package boundaries violations found."));
      return;
    }

    console.log(chalk.bold.red(`\n⚠️ Found ${violations.length} architectural rule violations:\n`));

    for (const v of violations) {
      const color = v.severity === "error" ? chalk.red : chalk.yellow;
      console.log(`${color(`[${v.severity.toUpperCase()}]`)} ${chalk.underline(v.filePath)}`);
      console.log(chalk.gray(`  Rule: ${v.ruleName} - ${v.message}\n`));
    }

    process.exit(1);
  } catch (err) {
    throw new Error(`Profile check failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
