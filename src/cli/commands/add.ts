/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import chalk from "chalk";
import { promises as fs } from "fs";
import path from "path";
import {
  renderTemplate,
  readStaticTemplateFile,
  getStackRules,
  getStackSkills,
} from "../../core/renderer.js";
import {
  updateFileWithBlock,
  writeRuleWithChunking,
} from "../../core/emitter.js";
import { analyzeModule } from "../../core/analyzer.js";
import { updateGitignore } from "./init.js";

interface AddOptions {
  path: string;
  agent: "both" | "codex" | "antigravity";
  dryRun: boolean;
}

export async function runAdd(stack: string, options: AddOptions) {
  const targetStack = stack.toLowerCase();
  const validStacks = ["spring-boot", "react-ts", "fastapi", "python-ai"];
  if (!validStacks.includes(targetStack)) {
    console.error(
      chalk.red(
        `Error: Invalid stack '${stack}'. Supported stacks are: ${validStacks.join(", ")}`
      )
    );
    process.exit(1);
  }

  const targetDir = path.resolve(options.path);
  console.log(chalk.bold.cyan("\n🚀 Agent Workflow Kit - Adding Stack Pack..."));
  console.log(chalk.dim("------------------------------------------"));
  console.log(`${chalk.bold("Target Folder:")}  ${chalk.green(targetDir)}`);
  console.log(`${chalk.bold("Stack Pack:")}     ${chalk.green(targetStack)}`);
  console.log(`${chalk.bold("Agent Profile:")}  ${chalk.green(options.agent)}`);
  console.log(`${chalk.bold("Dry Run:")}        ${options.dryRun ? chalk.yellow("Enabled 🧪") : chalk.gray("Disabled")}`);
  console.log(chalk.dim("------------------------------------------\n"));

  // 1. Analyze the target directory for this specific stack
  const analysis = await analyzeModule(targetDir, [targetStack as any]);

  // 2. Render stack guidelines for AGENTS.md
  let stackContent = "";
  try {
    const stackCtx = (analysis as any)[targetStack] || {};
    const rendered = await renderTemplate(`${targetStack}/AGENTS.md.hbs`, stackCtx);
    stackContent = rendered.trim();
  } catch (err) {
    console.error(
      chalk.red(
        `Error loading template for stack '${targetStack}': ${err instanceof Error ? err.message : String(err)}`
      )
    );
    process.exit(1);
  }

  // 3. Write or Update AGENTS.md and/or GEMINI.md in the target directory
  const geminiPath = path.join(targetDir, "GEMINI.md");
  const agentsPath = path.join(targetDir, "AGENTS.md");
  const moduleAgentsContent = await renderTemplate("common/AGENTS.md.hbs", {
    stackContent,
  });

  if (options.agent === "antigravity" || options.agent === "both") {
    if (options.dryRun) {
      console.log(chalk.gray(`[Dry Run] Would write/update GEMINI.md at ${geminiPath}`));
    } else {
      try {
        await fs.access(geminiPath);
        await updateFileWithBlock(geminiPath, "STACK_PACK", stackContent);
        console.log(chalk.green(`✔️ Updated STACK_PACK block in ${geminiPath}`));
      } catch {
        await fs.mkdir(targetDir, { recursive: true });
        await fs.writeFile(geminiPath, moduleAgentsContent, "utf8");
        console.log(chalk.green(`✔️ Created ${geminiPath}`));
      }
    }
  }

  if (options.agent === "codex" || options.agent === "both") {
    if (options.dryRun) {
      console.log(chalk.gray(`[Dry Run] Would write/update AGENTS.md at ${agentsPath}`));
    } else {
      try {
        await fs.access(agentsPath);
        await updateFileWithBlock(agentsPath, "STACK_PACK", stackContent);
        console.log(chalk.green(`✔️ Updated STACK_PACK block in ${agentsPath}`));
      } catch {
        await fs.mkdir(targetDir, { recursive: true });
        await fs.writeFile(agentsPath, moduleAgentsContent, "utf8");
        console.log(chalk.green(`✔️ Created ${agentsPath}`));
      }
    }
  }

  // Write IDE Rules to target directory
  const ideRulesContent = await renderTemplate("common/ide-rules.hbs", {
    agent: options.agent,
  });
  const ideFiles = [".cursorrules", ".copilot-instructions.md", ".clinerules"];
  for (const file of ideFiles) {
    if (options.dryRun) {
      console.log(chalk.gray(`[Dry Run] Would write IDE rule file to ${path.join(targetDir, file)}`));
    } else {
      await fs.writeFile(path.join(targetDir, file), ideRulesContent, "utf8");
    }
  }
  if (!options.dryRun) {
    console.log(chalk.green(`✔️ Created IDE prompt anchors at ${targetDir} (.cursorrules, .copilot-instructions.md, .clinerules)`));
  }
  await updateGitignore(targetDir, options.dryRun);

  // 4. Copy rules and skills for the target stack
  const stackCtx = (analysis as any)[targetStack] || {};

  // A. Copy Rules
  const rules = await getStackRules(targetStack as any);
  for (const rule of rules) {
    if (rule === "microservice-style.md" && (stackCtx as any).isMicroservice !== true) {
      continue;
    }
    const relativeRulePath = `${targetStack}/rules/${rule}`;
    try {
      const ruleContent = await readStaticTemplateFile(relativeRulePath, stackCtx);
      const targetRulePath = path.join(targetDir, ".agents", "rules", rule);

      if (options.dryRun) {
        console.log(chalk.gray(`[Dry Run] Would write rule to ${targetRulePath}`));
      } else {
        await writeRuleWithChunking(targetRulePath, ruleContent);
        console.log(chalk.green(`✔️ Wrote rule ${rule} to ${targetRulePath}`));
      }
    } catch (err) {
      console.error(
        chalk.red(
          `Failed to copy rule ${rule}: ${err instanceof Error ? err.message : String(err)}`
        )
      );
    }
  }

  // B. Copy Skills
  const skills = await getStackSkills(targetStack as any);
  for (const skill of skills) {
    const relativeSkillPath = `${targetStack}/skills/${skill}`;
    try {
      const skillContent = await readStaticTemplateFile(relativeSkillPath, stackCtx);
      const targetSkillPath = path.join(targetDir, ".agents", "skills", skill);

      if (options.dryRun) {
        console.log(chalk.gray(`[Dry Run] Would write skill to ${targetSkillPath}`));
      } else {
        await fs.mkdir(path.dirname(targetSkillPath), { recursive: true });
        await fs.writeFile(targetSkillPath, skillContent, "utf8");
        console.log(chalk.green(`✔️ Wrote skill ${skill} to ${targetSkillPath}`));
      }
    } catch (err) {
      console.error(
        chalk.red(
          `Failed to copy skill ${skill}: ${err instanceof Error ? err.message : String(err)}`
        )
      );
    }
  }

  // C. Copy Common Skills if not present
  try {
    const commonSkills = await getStackSkills("common");
    for (const skill of commonSkills) {
      const relativeSkillPath = `common/skills/${skill}`;
      try {
        const skillContent = await readStaticTemplateFile(relativeSkillPath, {});
        const targetSkillPath = path.join(targetDir, ".agents", "skills", skill);
        
        if (options.dryRun) {
          console.log(chalk.gray(`[Dry Run] Would ensure common skill ${skill} exists`));
        } else {
          try {
            await fs.access(targetSkillPath);
          } catch {
            await fs.mkdir(path.dirname(targetSkillPath), { recursive: true });
            await fs.writeFile(targetSkillPath, skillContent, "utf8");
            console.log(chalk.green(`✔️ Wrote common skill ${skill} to ${targetSkillPath}`));
          }
        }
      } catch (err) {
        console.error(
          chalk.red(
            `Failed to copy common skill ${skill}: ${err instanceof Error ? err.message : String(err)}`
          )
        );
      }
    }
  } catch {
    // Ignore
  }

  console.log(chalk.bold.green("\n🎉 Add completed successfully!"));
}
