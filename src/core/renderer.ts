/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import handlebars from "handlebars";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The templates directory is located at '../../templates' relative to 'dist/core/renderer.js'
const TEMPLATES_DIR = path.resolve(__dirname, "../../templates");

/**
 * Loads a Handlebars template, compiles it, and renders it with the given context.
 * @param templatePath Relative path to the template inside the templates directory (e.g. 'common/AGENTS.md.hbs')
 * @param context Key-value context data for compilation
 */
export async function renderTemplate(templatePath: string, context: any): Promise<string> {
  const fullPath = path.join(TEMPLATES_DIR, templatePath);
  const fileContent = await fs.readFile(fullPath, "utf8");
  const compiled = handlebars.compile(fileContent);
  return compiled(context);
}

/**
 * Reads a static rules file as-is without Handlebars interpolation.
 * @param filePath Relative path inside templates folder (e.g. 'spring-boot/rules/java-style.md')
 */
export async function readStaticTemplateFile(filePath: string): Promise<string> {
  const fullPath = path.join(TEMPLATES_DIR, filePath);
  return fs.readFile(fullPath, "utf8");
}

/**
 * Gets all rules files for a stack.
 */
export async function getStackRules(stack: string): Promise<string[]> {
  const rulesDir = path.join(TEMPLATES_DIR, stack, "rules");
  try {
    const files = await fs.readdir(rulesDir);
    return files.filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
}

/**
 * Gets all skills for a stack.
 */
export async function getStackSkills(stack: string): Promise<string[]> {
  const skillsDir = path.join(TEMPLATES_DIR, stack, "skills");
  try {
    const entries = await fs.readdir(skillsDir, { withFileTypes: true });
    const skills: string[] = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillFilePath = path.join(skillsDir, entry.name, "SKILL.md");
        try {
          await fs.access(skillFilePath);
          skills.push(`${entry.name}/SKILL.md`);
        } catch {
          // Ignore if SKILL.md doesn't exist
        }
      }
    }
    return skills;
  } catch {
    return [];
  }
}

