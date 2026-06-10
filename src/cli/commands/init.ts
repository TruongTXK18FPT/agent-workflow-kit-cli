/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import chalk from "chalk";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { detectProjectModules } from "../../core/detector.js";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface InitOptions {
  stack: "auto" | "spring-boot" | "react-ts" | "fastapi";
  agent: "both" | "codex" | "antigravity";
  dryRun: boolean;
}

export async function runInit(options: InitOptions) {
  const cwd = process.cwd();
  console.log(chalk.blue("Initializing agent-workflow-kit..."));
  console.log(chalk.gray(`- Stack Selection: ${options.stack}`));
  console.log(chalk.gray(`- Agent Profile: ${options.agent}`));
  console.log(chalk.gray(`- Dry Run: ${options.dryRun}\n`));

  let modules;
  if (options.stack !== "auto") {
    modules = [{ dir: cwd, name: ".", stacks: [options.stack] }];
  } else {
    modules = await detectProjectModules(cwd);
  }

  if (modules.length === 0) {
    console.log(
      chalk.yellow(
        "No standard stacks detected automatically. Creating general agent guidelines at root."
      )
    );
    const finalAgentsContent = await renderTemplate("common/AGENTS.md.hbs", {
      stackContent: "",
    });
    if (options.dryRun) {
      console.log(chalk.gray(`[Dry Run] Would write root AGENTS.md`));
    } else {
      const agentsPath = path.join(cwd, "AGENTS.md");
      await fs.writeFile(agentsPath, finalAgentsContent, "utf8");
      console.log(chalk.green("✔️ Created root AGENTS.md with general guidelines."));
    }
    return;
  }

  const isMonorepo =
    modules.length > 1 || (modules.length === 1 && modules[0].name !== ".");

  // Write root AGENTS.md with monorepo details
  if (isMonorepo) {
    let monorepoContent =
      "### 📦 Monorepo Multi-Module Project Structure\n\nThis repository is configured as a monorepo. Please load and follow the stack-specific guidelines in each subdirectory:\n\n";
    for (const mod of modules) {
      monorepoContent += `- **${mod.name}** (${mod.stacks.join(", ")}): Stack rules and guidelines are located at [${mod.name}/AGENTS.md](file:///${mod.dir.replace(/\\/g, "/")}/AGENTS.md)\n`;
    }

    const rootAgentsContent = await renderTemplate("common/AGENTS.md.hbs", {
      stackContent: monorepoContent.trim(),
    });

    const rootAgentsPath = path.join(cwd, "AGENTS.md");
    if (options.dryRun) {
      console.log(
        chalk.gray(
          `[Dry Run] Would write root AGENTS.md containing monorepo navigation:\n${monorepoContent}`
        )
      );
    } else {
      try {
        await fs.access(rootAgentsPath);
        await updateFileWithBlock(
          rootAgentsPath,
          "STACK_PACK",
          monorepoContent.trim()
        );
        console.log(chalk.green("✔️ Updated STACK_PACK block in root AGENTS.md."));
      } catch {
        await fs.writeFile(rootAgentsPath, rootAgentsContent, "utf8");
        console.log(chalk.green("✔️ Created root AGENTS.md for monorepo."));
      }
    }
  }

  // Process each module
  for (const mod of modules) {
    console.log(
      chalk.cyan(
        `\nProcessing module: ${mod.name} (stacks: ${mod.stacks.join(", ")})`
      )
    );

    let stackContent = "";
    for (const stack of mod.stacks) {
      try {
        const rendered = await renderTemplate(`${stack}/AGENTS.md.hbs`, {});
        stackContent += rendered + "\n\n";
      } catch (err) {
        console.warn(
          chalk.yellow(
            `Could not load template for stack '${stack}': ${err instanceof Error ? err.message : String(err)}`
          )
        );
      }
    }

    stackContent = stackContent.trim();

    // Render AGENTS.md for this module
    const agentsPath = path.join(mod.dir, "AGENTS.md");
    const moduleAgentsContent = await renderTemplate("common/AGENTS.md.hbs", {
      stackContent,
    });

    if (options.dryRun) {
      console.log(chalk.gray(`[Dry Run] Would write AGENTS.md at ${agentsPath}`));
    } else {
      try {
        await fs.access(agentsPath);
        await updateFileWithBlock(agentsPath, "STACK_PACK", stackContent);
        console.log(
          chalk.green(`✔️ Updated STACK_PACK block in ${mod.name}/AGENTS.md`)
        );
      } catch {
        await fs.writeFile(agentsPath, moduleAgentsContent, "utf8");
        console.log(chalk.green(`✔️ Created ${mod.name}/AGENTS.md`));
      }
    }

    // Copy rules and skills for each stack in this module
    for (const stack of mod.stacks) {
      // A. Rules
      const rules = await getStackRules(stack);
      for (const rule of rules) {
        const relativeRulePath = `${stack}/rules/${rule}`;
        try {
          const ruleContent = await readStaticTemplateFile(relativeRulePath);
          const targetRulePath = path.join(mod.dir, ".agents", "rules", rule);

          if (options.dryRun) {
            console.log(
              chalk.gray(
                `[Dry Run] Would write rule to ${targetRulePath} (length: ${ruleContent.length} chars)`
              )
            );
          } else {
            await writeRuleWithChunking(targetRulePath, ruleContent);
            console.log(
              chalk.green(
                `✔️ Wrote rule ${rule} to ${mod.name}/.agents/rules/${rule}`
              )
            );
          }
        } catch (err) {
          console.error(
            chalk.red(
              `Failed to copy rule ${rule}: ${err instanceof Error ? err.message : String(err)}`
            )
          );
        }
      }

      // B. Skills
      const skills = await getStackSkills(stack);
      for (const skill of skills) {
        const relativeSkillPath = `${stack}/skills/${skill}`;
        try {
          const skillContent = await readStaticTemplateFile(relativeSkillPath);
          const targetSkillPath = path.join(mod.dir, ".agents", "skills", skill);

          if (options.dryRun) {
            console.log(
              chalk.gray(`[Dry Run] Would write skill to ${targetSkillPath}`)
            );
          } else {
            await fs.mkdir(path.dirname(targetSkillPath), { recursive: true });
            await fs.writeFile(targetSkillPath, skillContent, "utf8");
            console.log(
              chalk.green(
                `✔️ Wrote skill ${skill} to ${mod.name}/.agents/skills/${skill}`
              )
            );
          }
        } catch (err) {
          console.error(
            chalk.red(
              `Failed to copy skill ${skill}: ${err instanceof Error ? err.message : String(err)}`
            )
          );
        }
      }
    }
  }

  console.log(chalk.bold.green("\n🎉 Initialization completed successfully!"));
}
