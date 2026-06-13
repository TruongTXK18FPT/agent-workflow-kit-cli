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
import { analyzeModule } from "../../core/analyzer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface InitOptions {
  stack: "auto" | "spring-boot" | "react-ts" | "next-js" | "nestjs" | "express" | "fastapi" | "python-ai" | "dotnet" | "golang" | "rust";
  agent: "both" | "codex" | "antigravity";
  dryRun: boolean;
}

function printSuccessAndNextSteps(options: InitOptions) {
  console.log(chalk.bold.green("\n🎉 Initialization completed successfully!"));

  if (!options.dryRun) {
    console.log(chalk.bold.cyan("\n👉 Next Steps:"));
    console.log(chalk.dim("------------------------------------------"));
    console.log(chalk.white(`1. Open & review the generated guidelines:`));
    const targetFile = options.agent === "antigravity" ? "GEMINI.md" : "AGENTS.md";
    console.log(chalk.gray(`   - Root: ${chalk.underline(targetFile)}`));
    console.log(chalk.gray(`   - Stack rules: ${chalk.underline(".agents/rules/")}`));
    console.log(chalk.white(`2. Setup automatic git pre-commit hook validation:`));
    console.log(chalk.cyan(`   npx agent-workflow-kit-cli doctor --install-hook`));
    console.log(chalk.white(`3. Export custom skills to register with your AI agent (e.g. Antigravity):`));
    console.log(chalk.cyan(`   npx agent-workflow-kit-cli export antigravity`));
    console.log(chalk.dim("------------------------------------------\n"));
  }
}

export async function updateGitignore(targetDir: string, dryRun: boolean) {
  const gitignorePath = path.join(targetDir, ".gitignore");
  const rulesToIgnore = [
    ".cursorrules",
    ".copilot-instructions.md",
    ".clinerules",
    "AGENTS.md",
    "GEMINI.md",
    ".agents/"
  ];
  if (dryRun) {
    console.log(chalk.gray(`[Dry Run] Would update .gitignore in ${targetDir} to exclude IDE rule files.`));
    return;
  }
  try {
    let content = "";
    try {
      content = await fs.readFile(gitignorePath, "utf8");
    } catch {
      // gitignore does not exist
    }

    const lines = content.split("\n").map((l) => l.trim());
    const missingRules = rulesToIgnore.filter((rule) => !lines.includes(rule));

    if (missingRules.length > 0) {
      const separator = content.length > 0 && !content.endsWith("\n") ? "\n\n" : "";
      const newContent =
        content +
        separator +
        "# Agent Workflow Kit IDE rules\n" +
        missingRules.join("\n") +
        "\n";
      await fs.writeFile(gitignorePath, newContent, "utf8");
      console.log(chalk.green("✔️ Updated .gitignore to exclude IDE rules."));
    }
  } catch (err) {
    console.warn(
      chalk.yellow(
        `Could not update .gitignore: ${err instanceof Error ? err.message : String(err)}`
      )
    );
  }
}

async function writeWorkspaceIdeRulesAndGitignore(cwd: string, options: InitOptions) {
  const ideRulesContent = await renderTemplate("common/ide-rules.hbs", {
    agent: options.agent,
  });
  const ideFiles = [".cursorrules", ".copilot-instructions.md", ".clinerules"];
  for (const file of ideFiles) {
    if (options.dryRun) {
      console.log(chalk.gray(`[Dry Run] Would write root ${file}`));
    } else {
      await fs.writeFile(path.join(cwd, file), ideRulesContent, "utf8");
    }
  }
  if (!options.dryRun) {
    console.log(chalk.green("✔️ Created workspace IDE prompt anchors (.cursorrules, .copilot-instructions.md, .clinerules)"));
  }
  await updateGitignore(cwd, options.dryRun);
}

async function writeDefaultWorkflow(cwd: string, options: InitOptions) {
  const workflowsDir = path.join(cwd, ".agents", "workflows");
  const workflowFile = path.join(workflowsDir, "pr-verification.json");

  const sampleWorkflow = {
    id: "pr-verification",
    name: "Pull Request Verification & ADR Flow",
    description: "Compiles project, validates architecture boundaries, creates ADR, and requests human sign-off.",
    version: "1.0.0",
    supportedArchitectures: ["layered", "clean-architecture", "feature-first"],
    requiredRoles: ["developer"],
    graph: {
      nodes: [
        {
          id: "build-and-lint",
          name: "Compile and Lint Check",
          type: "task",
          executor: "command",
          params: {
            command: "npm run build || mvn compile || python -m py_compile **/*.py"
          },
          mockOutput: {
            status: "success",
            duration: "3.5s"
          }
        },
        {
          id: "verify-architecture",
          name: "Verify Layer Boundaries",
          type: "task",
          executor: "command",
          params: {
            command: "npx agent-workflow-kit-cli profile"
          },
          mockOutput: {
            violationsFound: 0,
            status: "clean"
          }
        },
        {
          id: "create-adr",
          name: "Generate Architecture Decision Record",
          type: "task",
          executor: "adr-generate",
          params: {
            title: "Automated PR Validation Record",
            status: "proposed",
            context: "Auto-generated during pipeline test run.",
            decision: "All structural layers passed boundary checks successfully.",
            consequences: "Workspace rules integrity confirmed."
          },
          mockOutput: {
            adrId: "ADR-0001",
            status: "proposed"
          }
        },
        {
          id: "operator-approval",
          name: "Operator Sign-off Hook",
          type: "approval"
        }
      ],
      edges: [
        { sourceId: "build-and-lint", targetId: "verify-architecture" },
        { sourceId: "verify-architecture", targetId: "create-adr" },
        { sourceId: "create-adr", targetId: "operator-approval" }
      ]
    }
  };

  if (options.dryRun) {
    console.log(chalk.gray(`[Dry Run] Would create default workflow under ${workflowFile}`));
    return;
  }

  try {
    await fs.mkdir(workflowsDir, { recursive: true });
    await fs.writeFile(workflowFile, JSON.stringify(sampleWorkflow, null, 2), "utf8");
    console.log(chalk.green("✔️ Created default workflow pack: .agents/workflows/pr-verification.json"));
  } catch (err) {
    console.warn(chalk.yellow(`Could not create default workflow: ${err instanceof Error ? err.message : String(err)}`));
  }
}

export async function runInit(options: InitOptions) {
  const cwd = process.cwd();
  console.log(chalk.bold.cyan("\n🚀 Agent Workflow Kit - Initializing..."));
  console.log(chalk.dim("------------------------------------------"));
  console.log(`${chalk.bold("Stack Selection:")} ${chalk.green(options.stack)}`);
  console.log(`${chalk.bold("Agent Profile:")}   ${chalk.green(options.agent)}`);
  console.log(`${chalk.bold("Dry Run:")}         ${options.dryRun ? chalk.yellow("Enabled 🧪") : chalk.gray("Disabled")}`);
  console.log(chalk.dim("------------------------------------------\n"));

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

    if (options.agent === "antigravity" || options.agent === "both") {
      if (options.dryRun) {
        console.log(chalk.gray(`[Dry Run] Would write root GEMINI.md`));
      } else {
        const geminiPath = path.join(cwd, "GEMINI.md");
        await fs.writeFile(geminiPath, finalAgentsContent, "utf8");
        console.log(chalk.green("✔️ Created root GEMINI.md with general guidelines."));
      }
    }
    if (options.agent === "codex" || options.agent === "both") {
      if (options.dryRun) {
        console.log(chalk.gray(`[Dry Run] Would write root AGENTS.md`));
      } else {
        const agentsPath = path.join(cwd, "AGENTS.md");
        await fs.writeFile(agentsPath, finalAgentsContent, "utf8");
        console.log(chalk.green("✔️ Created root AGENTS.md with general guidelines."));
      }
    }

    await writeWorkspaceIdeRulesAndGitignore(cwd, options);
    printSuccessAndNextSteps(options);
    return;
  }

  const isMonorepo =
    modules.length > 1 || (modules.length === 1 && modules[0].name !== ".");

  // Write root files with monorepo details
  if (isMonorepo) {
    let monorepoContent =
      "### 📦 Monorepo Multi-Module Project Structure\n\nThis repository is configured as a monorepo. Please load and follow the stack-specific guidelines in each subdirectory:\n\n";
    for (const mod of modules) {
      const isAntigravity = options.agent === "antigravity";
      const targetFileName = isAntigravity ? "GEMINI.md" : "AGENTS.md";
      monorepoContent += `- **${mod.name}** (${mod.stacks.join(", ")}): Stack rules and guidelines are located at [${mod.name}/${targetFileName}](file:///${mod.dir.replace(/\\/g, "/")}/${targetFileName})\n`;
    }

    const rootAgentsContent = await renderTemplate("common/AGENTS.md.hbs", {
      stackContent: monorepoContent.trim(),
    });

    const rootGeminiPath = path.join(cwd, "GEMINI.md");
    const rootAgentsPath = path.join(cwd, "AGENTS.md");

    if (options.agent === "antigravity" || options.agent === "both") {
      if (options.dryRun) {
        console.log(
          chalk.gray(
            `[Dry Run] Would write root GEMINI.md containing monorepo navigation:\n${monorepoContent}`
          )
        );
      } else {
        try {
          await fs.access(rootGeminiPath);
          await updateFileWithBlock(
            rootGeminiPath,
            "STACK_PACK",
            monorepoContent.trim()
          );
          console.log(chalk.green("✔️ Updated STACK_PACK block in root GEMINI.md."));
        } catch {
          await fs.writeFile(rootGeminiPath, rootAgentsContent, "utf8");
          console.log(chalk.green("✔️ Created root GEMINI.md for monorepo."));
        }
      }
    }

    if (options.agent === "codex" || options.agent === "both") {
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
  }

  // Process each module
  for (const mod of modules) {
    console.log(
      chalk.cyan(
        `\nProcessing module: ${mod.name} (stacks: ${mod.stacks.join(", ")})`
      )
    );

    const analysis = await analyzeModule(mod.dir, mod.stacks);

    let stackContent = "";
    for (const stack of mod.stacks) {
      try {
        const stackCtx = analysis[stack] || {};
        const rendered = await renderTemplate(`${stack}/AGENTS.md.hbs`, stackCtx);
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

    // Render agent files for this module
    const geminiPath = path.join(mod.dir, "GEMINI.md");
    const agentsPath = path.join(mod.dir, "AGENTS.md");
    const moduleAgentsContent = await renderTemplate("common/AGENTS.md.hbs", {
      stackContent,
    });

    if (options.agent === "antigravity" || options.agent === "both") {
      if (options.dryRun) {
        console.log(chalk.gray(`[Dry Run] Would write GEMINI.md at ${geminiPath}`));
      } else {
        try {
          await fs.access(geminiPath);
          await updateFileWithBlock(geminiPath, "STACK_PACK", stackContent);
          console.log(
            chalk.green(`✔️ Updated STACK_PACK block in ${mod.name}/GEMINI.md`)
          );
        } catch {
          await fs.writeFile(geminiPath, moduleAgentsContent, "utf8");
          console.log(chalk.green(`✔️ Created ${mod.name}/GEMINI.md`));
        }
      }
    }

    if (options.agent === "codex" || options.agent === "both") {
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
    }

    // Copy common skills for this module
    try {
      const commonSkills = await getStackSkills("common");
      for (const skill of commonSkills) {
        const relativeSkillPath = `common/skills/${skill}`;
        try {
          const skillContent = await readStaticTemplateFile(relativeSkillPath, {});
          const targetSkillPath = path.join(mod.dir, ".agents", "skills", skill);
          await fs.mkdir(path.dirname(targetSkillPath), { recursive: true });
          await fs.writeFile(targetSkillPath, skillContent, "utf8");
          console.log(
            chalk.green(
              `✔️ Wrote common skill ${skill} to ${mod.name}/.agents/skills/${skill}`
            )
          );
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

    // Copy rules and skills for each stack in this module
    for (const stack of mod.stacks) {
      const stackCtx = analysis[stack] || {};

      // A. Rules
      const rules = await getStackRules(stack);
      for (const rule of rules) {
        if (rule === "microservice-style.md" && (stackCtx as any).isMicroservice !== true) {
          continue;
        }
        const relativeRulePath = `${stack}/rules/${rule}`;
        try {
          const ruleContent = await readStaticTemplateFile(relativeRulePath, stackCtx);
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
          const skillContent = await readStaticTemplateFile(relativeSkillPath, stackCtx);
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

  // Write workspace-level IDE rules and update gitignore
  await writeWorkspaceIdeRulesAndGitignore(cwd, options);

  // Write default sample workflow DAG
  await writeDefaultWorkflow(cwd, options);

  printSuccessAndNextSteps(options);
}
