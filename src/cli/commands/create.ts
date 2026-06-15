/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import chalk from "chalk";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { runInit } from "./init.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.resolve(__dirname, "../../../templates");

interface CreateOptions {
  dryRun: boolean;
}

export async function runCreate(
  template: string,
  projectNameInput: string | undefined,
  options: CreateOptions
) {
  console.log(chalk.bold.cyan("\n🚀 Agent Workflow Kit - Creating New Project..."));
  console.log(chalk.dim("------------------------------------------"));

  const validTemplates = ["spring-boot", "react-ts"];
  if (!validTemplates.includes(template)) {
    console.error(
      chalk.red(
        `Error: Invalid template '${template}'. Supported templates are: ${validTemplates.join(", ")}`
      )
    );
    process.exit(1);
  }

  const projectName = projectNameInput || `my-${template}-project`;
  const targetDir = path.resolve(process.cwd(), projectName);

  console.log(`${chalk.bold("Template:")}     ${chalk.green(template)}`);
  console.log(`${chalk.bold("Project Name:")} ${chalk.green(projectName)}`);
  console.log(`${chalk.bold("Target Dir:")}   ${chalk.green(targetDir)}`);
  console.log(`${chalk.bold("Dry Run:")}      ${options.dryRun ? chalk.yellow("Enabled 🧪") : chalk.gray("Disabled")}`);
  console.log(chalk.dim("------------------------------------------\n"));

  // Verify target directory doesn't exist or is empty
  try {
    const stat = await fs.stat(targetDir);
    if (stat.isDirectory()) {
      const files = await fs.readdir(targetDir);
      if (files.length > 0) {
        console.error(
          chalk.red(
            `Error: Directory '${targetDir}' already exists and is not empty.`
          )
        );
        process.exit(1);
      }
    }
  } catch {
    // Directory doesn't exist, which is fine
  }

  const templateProjectDir = path.join(TEMPLATES_DIR, template, "project");

  // Verify template project skeleton exists
  try {
    await fs.access(templateProjectDir);
  } catch {
    console.error(
      chalk.red(`Error: Project template for '${template}' was not found.`)
    );
    process.exit(1);
  }

  const safePackageName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (options.dryRun) {
    console.log(chalk.yellow(`[Dry Run] Would create project directory: ${targetDir}`));
    await listTemplateFilesDry(templateProjectDir, templateProjectDir, targetDir, safePackageName);
    console.log(chalk.bold.green("\n🎉 Dry Run completed successfully!"));
    return;
  }

  // Create project directory
  await fs.mkdir(targetDir, { recursive: true });

  // Copy and interpolate template files
  await copyAndInterpolate(templateProjectDir, templateProjectDir, targetDir, projectName, safePackageName);

  console.log(chalk.green(`✔️ Project skeleton for ${template} created successfully.`));

  // Initialize agent guidelines in the new project directory
  console.log(chalk.cyan("\nInitializing AI agent guidelines inside project..."));
  
  const originalCwd = process.cwd();
  try {
    process.chdir(targetDir);
    await runInit({
      stack: template as any,
      agent: "both",
      dryRun: false,
    });
  } catch (err) {
    console.error(
      chalk.red(
        `Warning: Failed to initialize agent guidelines: ${err instanceof Error ? err.message : String(err)}`
      )
    );
  } finally {
    process.chdir(originalCwd);
  }

  printCreateSuccess(projectName, template);
}

async function listTemplateFilesDry(
  baseSrc: string,
  currentSrc: string,
  destDir: string,
  safePackageName: string
) {
  const entries = await fs.readdir(currentSrc, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(currentSrc, entry.name);
    
    // Resolve entry destination name (mapping packageName to safePackageName)
    let destName = entry.name;
    if (entry.name === "packageName") {
      destName = safePackageName;
    }
    
    const relativePart = path.relative(baseSrc, srcPath);
    let resolvedRelativePart = relativePart
      .replace(/\\/g, "/")
      .replace(/\bpackageName\b/g, safePackageName);
    
    if (resolvedRelativePart.endsWith(".hbs")) {
      resolvedRelativePart = resolvedRelativePart.slice(0, -4);
    }
    
    const targetPath = path.join(destDir, resolvedRelativePart);

    if (entry.isDirectory()) {
      console.log(chalk.gray(`[Dry Run] Would create directory: ${targetPath}`));
      await listTemplateFilesDry(baseSrc, srcPath, destDir, safePackageName);
    } else {
      console.log(chalk.gray(`[Dry Run] Would write file:      ${targetPath}`));
    }
  }
}

async function copyAndInterpolate(
  baseSrc: string,
  currentSrc: string,
  destDir: string,
  projectName: string,
  safePackageName: string
) {
  const entries = await fs.readdir(currentSrc, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(currentSrc, entry.name);
    
    // Resolve destination path (replaces 'packageName' directory or file parts)
    let destName = entry.name;
    if (entry.name === "packageName") {
      destName = safePackageName;
    }
    
    const relativePart = path.relative(baseSrc, srcPath);
    let resolvedRelativePart = relativePart
      .replace(/\\/g, "/")
      .replace(/\bpackageName\b/g, safePackageName);
      
    if (resolvedRelativePart.endsWith(".hbs")) {
      resolvedRelativePart = resolvedRelativePart.slice(0, -4);
    }
      
    const targetPath = path.join(destDir, resolvedRelativePart);

    if (entry.isDirectory()) {
      await fs.mkdir(targetPath, { recursive: true });
      await copyAndInterpolate(baseSrc, srcPath, destDir, projectName, safePackageName);
    } else {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      
      // Interpolate text files
      const content = await fs.readFile(srcPath, "utf8");
      const interpolated = content
        .replace(/\{\{projectName\}\}/g, projectName)
        .replace(/\{\{safePackageName\}\}/g, safePackageName);
        
      await fs.writeFile(targetPath, interpolated, "utf8");
    }
  }
}

function printCreateSuccess(projectName: string, template: string) {
  console.log(chalk.bold.green(`\n🎉 Project '${projectName}' bootstrapped successfully!`));
  console.log(chalk.bold.cyan("\n👉 Next Steps to run/develop:"));
  console.log(chalk.dim("------------------------------------------"));
  console.log(chalk.white(`1. Change directory:`));
  console.log(chalk.cyan(`   cd ${projectName}`));
  
  if (template === "spring-boot") {
    console.log(chalk.white(`2. Build project using Maven:`));
    console.log(chalk.cyan(`   mvn clean install`));
    console.log(chalk.white(`3. Run the Spring Boot application:`));
    console.log(chalk.cyan(`   mvn spring-boot:run`));
  } else if (template === "react-ts") {
    console.log(chalk.white(`2. Install dependencies:`));
    console.log(chalk.cyan(`   npm install`));
    console.log(chalk.white(`3. Start the Vite dev server:`));
    console.log(chalk.cyan(`   npm run dev`));
  }
  
  console.log(chalk.white(`4. Start coding! AI guidelines and rules are already configured.`));
  console.log(chalk.dim("------------------------------------------\n"));
}
