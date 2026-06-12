/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { promises as fs } from "fs";
import path from "path";
import Handlebars from "handlebars";
import { ADRDefinition, ADRMetadata } from "./types.js";

const ADR_DIR = "docs/adr";

const DEFAULT_TEMPLATE = `---
id: {{id}}
title: {{{title}}}
status: {{status}}
date: {{date}}
{{#if metadata.decisionMakerRole}}
decisionMakerRole: {{metadata.decisionMakerRole}}
{{/if}}
{{#if metadata.affectedModules}}
affectedModules: {{#each metadata.affectedModules}}{{#if @index}}, {{/if}}{{this}}{{/each}}
{{/if}}
---

# {{{title}}}

## Context
{{{context}}}

## Decision
{{{decision}}}

## Consequences
{{{consequences}}}
`;

export class ADRService {
  /**
   * Helper to parse a markdown ADR file back into a structured ADRDefinition.
   */
  public static parseMarkdown(content: string, id: string): ADRDefinition {
    const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    let title = "Untitled ADR";
    let status: 'proposed' | 'accepted' | 'rejected' | 'superseded' = 'proposed';
    let date = new Date().toISOString().split("T")[0];
    let body = content;
    const metadata: ADRMetadata = {};

    if (match) {
      const frontmatter = match[1];
      body = match[2];

      const lines = frontmatter.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf(":");
        if (eqIdx !== -1) {
          const key = trimmed.substring(0, eqIdx).trim();
          const value = trimmed.substring(eqIdx + 1).trim();
          if (key === "title") title = value.replace(/^['"]|['"]$/g, "");
          else if (key === "status") {
            const parsedStatus = value.replace(/^['"]|['"]$/g, "") as any;
            if (['proposed', 'accepted', 'rejected', 'superseded'].includes(parsedStatus)) {
              status = parsedStatus;
            }
          } else if (key === "date") date = value;
          else if (key === "decisionMakerRole") metadata.decisionMakerRole = value;
          else if (key === "affectedModules") {
            metadata.affectedModules = value.split(",").map((s) => s.trim());
          }
        }
      }
    }

    // Extract headers for sections (Context, Decision, Consequences)
    let context = "";
    let decision = "";
    let consequences = "";

    const contextMatch = body.match(/##\s+Context\r?\n([\s\S]*?)(?=##\s+Decision|##\s+Consequences|$)/i);
    const decisionMatch = body.match(/##\s+Decision\r?\n([\s\S]*?)(?=##\s+Context|##\s+Consequences|$)/i);
    const consequencesMatch = body.match(/##\s+Consequences\r?\n([\s\S]*?)(?=##\s+Context|##\s+Decision|$)/i);

    if (contextMatch) context = contextMatch[1].trim();
    if (decisionMatch) decision = decisionMatch[1].trim();
    if (consequencesMatch) consequences = consequencesMatch[1].trim();

    // In case of headers missing
    if (!context && !decision && !consequences) {
      context = body.trim();
    }

    return {
      id,
      title,
      date,
      status,
      context,
      decision,
      consequences,
      metadata,
    };
  }

  /**
   * Scans docs/adr/ and calculates the next incremental number (e.g. ADR-0003).
   */
  public static async getNextId(workspaceRoot: string): Promise<string> {
    const fullDir = path.join(workspaceRoot, ADR_DIR);
    try {
      const files = await fs.readdir(fullDir);
      let maxNum = 0;
      for (const file of files) {
        const match = file.match(/^ADR-(\d{4})\.md$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) {
            maxNum = num;
          }
        }
      }
      const nextNum = maxNum + 1;
      return `ADR-${String(nextNum).padStart(4, "0")}`;
    } catch {
      return "ADR-0001";
    }
  }

  /**
   * Generates a new ADR file in the docs/adr/ directory.
   */
  public static async create(
    workspaceRoot: string,
    adr: Omit<ADRDefinition, "id" | "date">,
    templateString?: string
  ): Promise<ADRDefinition> {
    const id = await ADRService.getNextId(workspaceRoot);
    const date = new Date().toISOString().split("T")[0];
    const fullDir = path.join(workspaceRoot, ADR_DIR);

    const definition: ADRDefinition = {
      ...adr,
      id,
      date,
    };

    const template = Handlebars.compile(templateString || DEFAULT_TEMPLATE);
    const rendered = template(definition);

    await fs.mkdir(fullDir, { recursive: true });
    const filePath = path.join(fullDir, `${id}.md`);
    await fs.writeFile(filePath, rendered, "utf8");

    return definition;
  }

  /**
   * Loads a specific ADR by ID.
   */
  public static async load(workspaceRoot: string, id: string): Promise<ADRDefinition> {
    const fullDir = path.join(workspaceRoot, ADR_DIR);
    const filePath = path.join(fullDir, `${id}.md`);

    try {
      const content = await fs.readFile(filePath, "utf8");
      return ADRService.parseMarkdown(content, id);
    } catch (err) {
      throw new Error(`Failed to load ADR '${id}': ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * Lists all ADRs sorted by ID.
   */
  public static async list(workspaceRoot: string): Promise<ADRDefinition[]> {
    const fullDir = path.join(workspaceRoot, ADR_DIR);
    const adrs: ADRDefinition[] = [];

    try {
      const files = await fs.readdir(fullDir);
      for (const file of files) {
        if (file.match(/^ADR-\d{4}\.md$/)) {
          const id = path.basename(file, ".md");
          const adr = await ADRService.load(workspaceRoot, id);
          adrs.push(adr);
        }
      }
    } catch {
      // Directory may not exist yet
    }

    return adrs.sort((a, b) => a.id.localeCompare(b.id));
  }

  /**
   * Performs case-insensitive search across titles, contexts, decisions, and consequences.
   */
  public static async search(workspaceRoot: string, keyword: string): Promise<ADRDefinition[]> {
    const all = await ADRService.list(workspaceRoot);
    const searchLower = keyword.toLowerCase();

    return all.filter((adr) => {
      return (
        adr.title.toLowerCase().includes(searchLower) ||
        adr.context.toLowerCase().includes(searchLower) ||
        adr.decision.toLowerCase().includes(searchLower) ||
        adr.consequences.toLowerCase().includes(searchLower)
      );
    });
  }

  /**
   * Updates status metadata parameter for an ADR.
   */
  public static async updateStatus(
    workspaceRoot: string,
    id: string,
    newStatus: "proposed" | "accepted" | "rejected" | "superseded"
  ): Promise<ADRDefinition> {
    const adr = await ADRService.load(workspaceRoot, id);
    adr.status = newStatus;

    // Render it back
    const template = Handlebars.compile(DEFAULT_TEMPLATE);
    const rendered = template(adr);

    const fullDir = path.join(workspaceRoot, ADR_DIR);
    const filePath = path.join(fullDir, `${id}.md`);
    await fs.writeFile(filePath, rendered, "utf8");

    return adr;
  }
}
