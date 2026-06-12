/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { ADRService } from "../src/core/awos/adr.js";
import { ADRDefinition } from "../src/core/awos/types.js";

const TEMP_WORKSPACE = path.join(os.tmpdir(), "awk-test-adr-workspace");

describe("AWOS ADR (Architectural Decision Record) Service", () => {
  beforeAll(async () => {
    await fs.mkdir(TEMP_WORKSPACE, { recursive: true });
  });

  afterAll(async () => {
    try {
      await fs.rm(TEMP_WORKSPACE, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  });

  it("should generate incremental IDs and render files successfully", async () => {
    const adr1 = await ADRService.create(TEMP_WORKSPACE, {
      title: "Use PostgreSQL Database",
      status: "proposed",
      context: "We need an SQL storage.",
      decision: "We will adopt PostgreSQL 16.",
      consequences: "Maintenance overhead.",
      metadata: { decisionMakerRole: "Architect" },
    });

    expect(adr1.id).toBe("ADR-0001");
    expect(adr1.date).toBeDefined();

    const file1Exists = await fs.stat(path.join(TEMP_WORKSPACE, "docs/adr/ADR-0001.md")).then(s => s.isFile()).catch(() => false);
    expect(file1Exists).toBe(true);

    const adr2 = await ADRService.create(TEMP_WORKSPACE, {
      title: "Adopt Redis Caching",
      status: "accepted",
      context: "Performance optimizations.",
      decision: "Add Redis store.",
      consequences: "Faster endpoints response.",
    });

    expect(adr2.id).toBe("ADR-0002");
  });

  it("should correctly parse frontmatter and markdown sections", async () => {
    const loaded = await ADRService.load(TEMP_WORKSPACE, "ADR-0001");
    expect(loaded.title).toBe("Use PostgreSQL Database");
    expect(loaded.status).toBe("proposed");
    expect(loaded.context).toBe("We need an SQL storage.");
    expect(loaded.decision).toBe("We will adopt PostgreSQL 16.");
    expect(loaded.consequences).toBe("Maintenance overhead.");
    expect(loaded.metadata?.decisionMakerRole).toBe("Architect");
  });

  it("should support keyword searches across fields", async () => {
    const matches = await ADRService.search(TEMP_WORKSPACE, "postgres");
    expect(matches.length).toBe(1);
    expect(matches[0].id).toBe("ADR-0001");

    const noMatches = await ADRService.search(TEMP_WORKSPACE, "non-existent-word");
    expect(noMatches.length).toBe(0);
  });

  it("should update status and rewrite the decision file", async () => {
    const updated = await ADRService.updateStatus(TEMP_WORKSPACE, "ADR-0001", "accepted");
    expect(updated.status).toBe("accepted");

    const reloaded = await ADRService.load(TEMP_WORKSPACE, "ADR-0001");
    expect(reloaded.status).toBe("accepted");
  });
});
