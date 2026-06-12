/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import handlebars from "handlebars";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadConfig } from "./config.js";

// Register custom Handlebars helpers
handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The templates directory is located at '../../templates' relative to 'dist/core/renderer.js'
const TEMPLATES_DIR = path.resolve(__dirname, "../../templates");

/**
 * Resolves the path of a template file, prioritizing the customTemplatesPath if configured.
 */
async function resolveTemplatePath(relativePath: string): Promise<string> {
  const config = await loadConfig();
  if (config.customTemplatesPath) {
    const customFullPath = path.resolve(process.cwd(), config.customTemplatesPath, relativePath);
    try {
      await fs.access(customFullPath);
      return customFullPath;
    } catch {
      // Fallback to default
    }
  }
  return path.join(TEMPLATES_DIR, relativePath);
}

/**
 * Loads a Handlebars template, compiles it, and renders it with the given context.
 * @param templatePath Relative path to the template inside the templates directory (e.g. 'common/AGENTS.md.hbs')
 * @param context Key-value context data for compilation
 */
export async function renderTemplate(templatePath: string, context: any): Promise<string> {
  const fullPath = await resolveTemplatePath(templatePath);
  const fileContent = await fs.readFile(fullPath, "utf8");
  const compiled = handlebars.compile(fileContent);
  return compiled(context);
}

/**
 * Reads a static template file (rules or skills) with optional Handlebars interpolation.
 * @param filePath Relative path inside templates folder (e.g. 'spring-boot/rules/java-style.md')
 * @param context Optional key-value data for compilation
 */
export async function readStaticTemplateFile(filePath: string, context?: any): Promise<string> {
  const fullPath = await resolveTemplatePath(filePath);
  const fileContent = await fs.readFile(fullPath, "utf8");
  if (context) {
    const compiled = handlebars.compile(fileContent);
    return compiled(context);
  }
  return fileContent;
}

/**
 * Gets all rules files for a stack.
 */
export async function getStackRules(stack: string): Promise<string[]> {
  const relativeRulesDir = path.join(stack, "rules");
  const rules = new Set<string>();

  // Try custom first
  const config = await loadConfig();
  if (config.customTemplatesPath) {
    const customRulesDir = path.resolve(process.cwd(), config.customTemplatesPath, relativeRulesDir);
    try {
      const files = await fs.readdir(customRulesDir);
      for (const f of files) {
        if (f.endsWith(".md")) rules.add(f);
      }
    } catch {
      // Ignore
    }
  }

  // Fallback default
  const defaultRulesDir = path.join(TEMPLATES_DIR, stack, "rules");
  try {
    const files = await fs.readdir(defaultRulesDir);
    for (const f of files) {
      if (f.endsWith(".md")) rules.add(f);
    }
  } catch {
    // Ignore
  }

  return Array.from(rules);
}

/**
 * Gets all skills for a stack.
 */
export async function getStackSkills(stack: string): Promise<string[]> {
  const relativeSkillsDir = path.join(stack, "skills");
  const skills = new Set<string>();

  const checkDir = async (dirPath: string) => {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const skillFilePath = path.join(dirPath, entry.name, "SKILL.md");
          try {
            await fs.access(skillFilePath);
            skills.add(`${entry.name}/SKILL.md`);
          } catch {
            // Ignore
          }
        }
      }
    } catch {
      // Ignore
    }
  };

  // Check custom
  const config = await loadConfig();
  if (config.customTemplatesPath) {
    const customSkillsDir = path.resolve(process.cwd(), config.customTemplatesPath, relativeSkillsDir);
    await checkDir(customSkillsDir);
  }

  // Check default
  const defaultSkillsDir = path.join(TEMPLATES_DIR, stack, "skills");
  await checkDir(defaultSkillsDir);

  return Array.from(skills);
}
