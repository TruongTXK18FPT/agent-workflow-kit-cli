/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import chalk from "chalk";
import { promises as fs } from "fs";
import path from "path";
import { execa } from "execa";
import { detectProjectStack } from "../../core/detector.js";

interface DoctorOptions {
  installHook: boolean;
}

export async function runDoctor(options: DoctorOptions) {
  const cwd = process.cwd();

  if (options.installHook) {
    console.log(chalk.blue("Installing Git pre-commit hook..."));
    const gitPath = path.join(cwd, ".git");
    
    try {
      const gitStat = await fs.stat(gitPath);
      if (!gitStat.isDirectory()) {
        throw new Error(".git is not a directory");
      }
    } catch {
      console.error(chalk.red("Error: Git repository not detected in the current directory."));
      return;
    }

    const hooksPath = path.join(gitPath, "hooks");
    await fs.mkdir(hooksPath, { recursive: true });

    const preCommitPath = path.join(hooksPath, "pre-commit");
    const hookScript = `#!/bin/sh
# AWK-START: DOCTOR_HOOK
npx agent-workflow-kit-cli doctor || exit 1
# AWK-END: DOCTOR_HOOK
`;

    let existingHook = "";
    try {
      existingHook = await fs.readFile(preCommitPath, "utf8");
    } catch {
      // File doesn't exist
    }

    if (existingHook.includes("AWK-START: DOCTOR_HOOK")) {
      console.log(chalk.yellow("Git pre-commit hook is already installed."));
    } else {
      const separator = existingHook ? "\n" : "";
      await fs.writeFile(preCommitPath, `${existingHook}${separator}${hookScript}`, "utf8");
      
      // Make it executable (cross-platform safe)
      try {
        await fs.chmod(preCommitPath, 0o755);
      } catch (err) {
        console.warn(chalk.yellow(`Could not set executable permissions on hook: ${err instanceof Error ? err.message : String(err)}`));
      }
      
      console.log(chalk.green("Git pre-commit hook installed successfully!"));
    }
    return;
  }

  console.log(chalk.blue("Running doctor checks on repository..."));
  
  // 1. Detect Stack
  const stacks = await detectProjectStack(cwd);
  console.log(chalk.gray(`Detected stacks: ${stacks.join(", ") || "None"}`));

  if (stacks.length === 0) {
    console.log(chalk.yellow("No standard stack pack detected. Nothing to validate."));
    return;
  }

  // 2. Validate
  let passed = true;

  for (const stack of stacks) {
    console.log(chalk.blue(`\nValidating stack: ${stack}...`));
    
    try {
      if (stack === "spring-boot") {
        console.log(chalk.gray("Running: ./mvnw clean compile"));
        await execa("./mvnw", ["clean", "compile"], { cwd, stdio: "inherit" });
      } else if (stack === "fastapi") {
        console.log(chalk.gray("Running: ruff check ."));
        await execa("ruff", ["check", "."], { cwd, stdio: "inherit" });
      } else if (stack === "python-ai") {
        let cmd = "ruff";
        let args = ["check", "."];
        try {
          const hasPoetry = await fs.stat(path.join(cwd, "poetry.lock")).then(s => s.isFile()).catch(() => false);
          if (hasPoetry) {
            cmd = "poetry";
            args = ["run", "python", "-m", "ruff", "check", "."];
          } else {
            const hasPipenv = await fs.stat(path.join(cwd, "Pipfile")).then(s => s.isFile()).catch(() => false);
            if (hasPipenv) {
              cmd = "pipenv";
              args = ["run", "python", "-m", "ruff", "check", "."];
            }
          }
        } catch {}
        console.log(chalk.gray(`Running: ${cmd} ${args.join(" ")}`));
        await execa(cmd, args, { cwd, stdio: "inherit" });
      } else if (
        stack === "react-ts" ||
        stack === "next-js" ||
        stack === "nestjs" ||
        stack === "express"
      ) {
        console.log(chalk.gray("Running: npx tsc --noEmit"));
        await execa("npx", ["tsc", "--noEmit"], { cwd, stdio: "inherit" });
      } else if (stack === "dotnet") {
        console.log(chalk.gray("Running: dotnet build"));
        await execa("dotnet", ["build"], { cwd, stdio: "inherit" });
      }
      console.log(chalk.green(`✔️ ${stack} validation passed!`));
    } catch (err) {
      console.error(chalk.red(`❌ ${stack} validation failed: ${err instanceof Error ? err.message : String(err)}`));
      passed = false;
    }
  }

  if (passed) {
    console.log(chalk.green("\n🎉 All doctor checks passed successfully!"));
  } else {
    console.error(chalk.red("\n❌ Some doctor checks failed. Please fix the issues before proceeding."));
    process.exit(1);
  }
}
