/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import chalk from "chalk";
import { promises as fs } from "fs";
import path from "path";
import { writeToClipboard } from "../../utils/clipboard.js";

interface ExportOptions {
  clipboard: boolean;
  output?: string;
}

interface SkillData {
  name: string;
  description: string;
  body: string;
}

/**
 * Recursively find all skill files (.md or SKILL.md) in a directory.
 */
async function findSkillFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await findSkillFiles(fullPath)));
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(fullPath);
      }
    }
  } catch {
    // Ignore if directory doesn't exist
  }
  return files;
}

/**
 * Parse a markdown file with optional YAML frontmatter.
 */
export function parseSkillFile(content: string, defaultName: string): SkillData {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  let name = defaultName;
  let description = "";
  let body = content;

  if (match) {
    const yamlText = match[1];
    body = match[2];

    const lines = yamlText.split("\n");
    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex !== -1) {
        const key = line.slice(0, colonIndex).trim().toLowerCase();
        const value = line.slice(colonIndex + 1).trim();
        if (key === "name") {
          name = value.replace(/^['"]|['"]$/g, ""); // strip quotes
        } else if (key === "description") {
          description = value.replace(/^['"]|['"]$/g, ""); // strip quotes
        }
      }
    }
  }

  return { name, description, body: body.trim() };
}

export async function runExport(target: string, options: ExportOptions) {
  const normTarget = target.toLowerCase();
  if (normTarget !== "antigravity" && normTarget !== "codex") {
    console.warn(
      chalk.yellow(
        `Warning: Currently, only 'antigravity' and 'codex' targets are officially optimized, but trying to export custom rules anyway.`
      )
    );
  }

  const cwd = process.cwd();
  const skillsDir = path.join(cwd, ".agents", "skills");

  console.log(chalk.blue(`Scanning for custom agent skills in ${skillsDir}...`));
  const skillFiles = await findSkillFiles(skillsDir);

  if (skillFiles.length === 0) {
    console.log(
      chalk.yellow(`No skill files (.md) found under '.agents/skills/'.`)
    );
    return;
  }

  const parsedSkills: SkillData[] = [];
  for (const file of skillFiles) {
    try {
      const content = await fs.readFile(file, "utf8");
      // Default name to parent dir or file name
      const ext = path.extname(file);
      const baseName = path.basename(file, ext);
      const parentDirName = path.basename(path.dirname(file));
      const defaultName =
        baseName.toLowerCase() === "skill" ? parentDirName : baseName;

      const parsed = parseSkillFile(content, defaultName);
      parsedSkills.push(parsed);
    } catch (err) {
      console.warn(
        chalk.red(
          `Failed to parse ${file}: ${err instanceof Error ? err.message : String(err)}`
        )
      );
    }
  }

  if (parsedSkills.length === 0) {
    console.log(chalk.yellow(`No valid skills were successfully parsed.`));
    return;
  }

  // Format the consolidated prompts
  let output = `System update: The repository has the following workflows/skills configured. You are trained to execute them upon request:\n\n`;
  for (const skill of parsedSkills) {
    output += `=== SKILL: ${skill.name} ===\n`;
    if (skill.description) {
      output += `Description: ${skill.description}\n`;
    }
    output += `Instructions:\n${skill.body}\n`;
    output += `=============================\n\n`;
  }

  output = output.trim();

  if (options.output) {
    console.log(chalk.blue(`Writing exported workflows to file: ${options.output}...`));
    try {
      const fullOutputPath = path.resolve(cwd, options.output);
      await fs.mkdir(path.dirname(fullOutputPath), { recursive: true });
      await fs.writeFile(fullOutputPath, output, "utf8");
      console.log(
        chalk.green(
          `✔️ Successfully exported ${parsedSkills.length} custom workflow(s) to ${options.output}!`
        )
      );
    } catch (err) {
      console.error(
        chalk.red(
          `❌ Failed to write export file: ${err instanceof Error ? err.message : String(err)}`
        )
      );
    }
    return;
  }

  if (options.clipboard) {
    console.log(chalk.blue("Copying exported workflows to clipboard..."));
    const success = await writeToClipboard(output);
    if (success) {
      console.log(
        chalk.green(
          `✔️ Successfully copied ${parsedSkills.length} custom workflow(s) to clipboard!`
        )
      );
      console.log(
        chalk.gray(
          "You can now paste them directly into your Antigravity chat console to register these commands."
        )
      );
    } else {
      console.warn(
        chalk.yellow("⚠️ Failed to write to clipboard. Outputting to stdout instead:")
      );
      console.log("\n" + output + "\n");
    }
  } else {
    console.log("\n" + output + "\n");
  }
}
