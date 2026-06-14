/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import chalk from "chalk";
import { promises as fs } from "fs";
import path from "path";
import { execa } from "execa";
import { detectProjectModules } from "../../core/detector.js";

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
  
  // 1. Detect Modules
  const modules = await detectProjectModules(cwd);
  
  if (modules.length === 0) {
    console.log(chalk.yellow("No standard project modules detected. Nothing to validate."));
    return;
  }

  console.log(chalk.gray(`Detected modules: ${modules.map(m => `${m.name} [${m.stacks.join(", ")}]`).join(", ")}`));

  // 2. Validate
  let passed = true;

  for (const mod of modules) {
    console.log(chalk.blue(`\nValidating module: ${mod.name === "." ? "root" : mod.name}...`));
    for (const stack of mod.stacks) {
      console.log(chalk.cyan(`  Validating stack: ${stack}...`));
      
      try {
        if (stack === "spring-boot") {
          // Check for maven wrapper or gradle wrapper
          const hasGradle =
            (await fs.stat(path.join(mod.dir, "build.gradle")).then((s) => s.isFile()).catch(() => false)) ||
            (await fs.stat(path.join(mod.dir, "build.gradle.kts")).then((s) => s.isFile()).catch(() => false));
          
          if (hasGradle) {
            let gradlewPath = "./gradlew";
            try {
              await fs.access(path.join(mod.dir, "gradlew"));
            } catch {
              try {
                await fs.access(path.join(cwd, "gradlew"));
                gradlewPath = path.relative(mod.dir, path.join(cwd, "gradlew")).replace(/\\/g, "/");
                if (!gradlewPath.startsWith(".")) gradlewPath = "./" + gradlewPath;
              } catch {
                gradlewPath = "gradle";
              }
            }
            console.log(chalk.gray(`Running: ${gradlewPath} check in ${mod.dir}`));
            await execa(gradlewPath, ["check"], { cwd: mod.dir, stdio: "inherit" });
          } else {
            let mvnwPath = "./mvnw";
            try {
              await fs.access(path.join(mod.dir, "mvnw"));
            } catch {
              try {
                await fs.access(path.join(cwd, "mvnw"));
                mvnwPath = path.relative(mod.dir, path.join(cwd, "mvnw")).replace(/\\/g, "/");
                if (!mvnwPath.startsWith(".")) mvnwPath = "./" + mvnwPath;
              } catch {
                mvnwPath = "mvn";
              }
            }
            console.log(chalk.gray(`Running: ${mvnwPath} clean compile in ${mod.dir}`));
            await execa(mvnwPath, ["clean", "compile"], { cwd: mod.dir, stdio: "inherit" });
          }
        } else if (stack === "fastapi") {
          console.log(chalk.gray(`Running: ruff check . in ${mod.dir}`));
          await execa("ruff", ["check", "."], { cwd: mod.dir, stdio: "inherit" });
        } else if (stack === "python-ai") {
          let cmd = "ruff";
          let args = ["check", "."];
          try {
            const hasPoetry = await fs.stat(path.join(mod.dir, "poetry.lock")).then(s => s.isFile()).catch(() => false);
            if (hasPoetry) {
              cmd = "poetry";
              args = ["run", "ruff", "check", "."];
            } else {
              const hasPipenv = await fs.stat(path.join(mod.dir, "Pipfile")).then(s => s.isFile()).catch(() => false);
              if (hasPipenv) {
                cmd = "pipenv";
                args = ["run", "ruff", "check", "."];
              }
            }
          } catch {}
          console.log(chalk.gray(`Running: ${cmd} ${args.join(" ")} in ${mod.dir}`));
          await execa(cmd, args, { cwd: mod.dir, stdio: "inherit" });
        } else if (
          stack === "react-ts" ||
          stack === "next-js" ||
          stack === "nestjs" ||
          stack === "express"
        ) {
          let pm: "npm" | "pnpm" | "yarn" | "bun" = "npm";
          try {
            const hasYarnLock = await fs.stat(path.join(mod.dir, "yarn.lock")).then((s) => s.isFile()).catch(() => false);
            const hasPnpmLock = await fs.stat(path.join(mod.dir, "pnpm-lock.yaml")).then((s) => s.isFile()).catch(() => false);
            const hasBunLockb = await fs.stat(path.join(mod.dir, "bun.lockb")).then((s) => s.isFile()).catch(() => false);
            const hasBunLock = await fs.stat(path.join(mod.dir, "bun.lock")).then((s) => s.isFile()).catch(() => false);
            if (hasYarnLock) pm = "yarn";
            else if (hasPnpmLock) pm = "pnpm";
            else if (hasBunLockb || hasBunLock) pm = "bun";
          } catch {}

          try {
            const pkgContent = await fs.readFile(path.join(mod.dir, "package.json"), "utf8");
            const pkg = JSON.parse(pkgContent);
            const scripts = pkg.scripts || {};
            
            if (scripts.lint) {
              console.log(chalk.gray(`Running: ${pm} run lint in ${mod.dir}`));
              await execa(pm, ["run", "lint"], { cwd: mod.dir, stdio: "inherit" });
            }
            
            console.log(chalk.gray(`Running: npx tsc --noEmit in ${mod.dir}`));
            await execa("npx", ["tsc", "--noEmit"], { cwd: mod.dir, stdio: "inherit" });

            if (scripts.test) {
              const hasVitest = pkg.dependencies?.vitest || pkg.devDependencies?.vitest;
              const hasJest = pkg.dependencies?.jest || pkg.devDependencies?.jest;
              
              let args = ["run", "test"];
              if (hasVitest || hasJest) {
                if (pm === "npm") {
                  args = ["run", "test", "--", "--run"];
                } else {
                  args = ["run", "test", "--run"];
                }
              }
              console.log(chalk.gray(`Running: ${pm} ${args.join(" ")} in ${mod.dir}`));
              await execa(pm, args, { cwd: mod.dir, stdio: "inherit", env: { ...process.env, CI: "true" } });
            }
          } catch {
            console.log(chalk.gray(`Running: npx tsc --noEmit in ${mod.dir}`));
            await execa("npx", ["tsc", "--noEmit"], { cwd: mod.dir, stdio: "inherit" });
          }
        } else if (stack === "dotnet") {
          console.log(chalk.gray(`Running: dotnet build in ${mod.dir}`));
          await execa("dotnet", ["build"], { cwd: mod.dir, stdio: "inherit" });
          console.log(chalk.gray(`Running: dotnet test in ${mod.dir}`));
          await execa("dotnet", ["test"], { cwd: mod.dir, stdio: "inherit" });
        } else if (stack === "golang") {
          console.log(chalk.gray(`Running: go build ./... in ${mod.dir}`));
          await execa("go", ["build", "./..."], { cwd: mod.dir, stdio: "inherit" });
          console.log(chalk.gray(`Running: go test ./... in ${mod.dir}`));
          await execa("go", ["test", "./..."], { cwd: mod.dir, stdio: "inherit" });
        } else if (stack === "rust") {
          console.log(chalk.gray(`Running: cargo check in ${mod.dir}`));
          await execa("cargo", ["check"], { cwd: mod.dir, stdio: "inherit" });
          console.log(chalk.gray(`Running: cargo test in ${mod.dir}`));
          await execa("cargo", ["test"], { cwd: mod.dir, stdio: "inherit" });
        }
        console.log(chalk.green(`  ✔️ ${stack} validation passed!`));
      } catch (err) {
        console.error(chalk.red(`  ❌ ${stack} validation failed: ${err instanceof Error ? err.message : String(err)}`));
        passed = false;
      }
    }
  }

  if (passed) {
    console.log(chalk.green("\n🎉 All doctor checks passed successfully!"));
  } else {
    console.error(chalk.red("\n❌ Some doctor checks failed. Please fix the issues before proceeding."));
    process.exit(1);
  }
}
