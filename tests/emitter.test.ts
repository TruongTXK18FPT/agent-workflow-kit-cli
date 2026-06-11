import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { chunkText, writeRuleWithChunking, updateFileWithBlock } from "../src/core/emitter.js";

describe("Emitter Core", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "awk-test-emitter-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("should chunk text correctly at line boundaries", () => {
    const content = "line1\nline2\nline3\nline4";
    const chunks = chunkText(content, 12);
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toBe("line1\nline2");
    expect(chunks[1]).toBe("line3\nline4");
  });

  it("should write rule directly if content length <= maxChars", async () => {
    const targetFile = path.join(tmpDir, "rule.md");
    const content = "Short rule content";
    await writeRuleWithChunking(targetFile, content, 50);

    const fileContent = await fs.readFile(targetFile, "utf8");
    expect(fileContent).toBe(content);
  });

  it("should chunk rule and create index file if content length > maxChars", async () => {
    const targetFile = path.join(tmpDir, "rule.md");
    const content = "line1\nline2\nline3\nline4";
    await writeRuleWithChunking(targetFile, content, 12);

    const indexContent = await fs.readFile(targetFile, "utf8");
    expect(indexContent).toContain("This ruleset is split into multiple parts");
    expect(indexContent).toContain("- @rule-part1.md");
    expect(indexContent).toContain("- @rule-part2.md");

    const part1 = await fs.readFile(path.join(tmpDir, "rule-part1.md"), "utf8");
    expect(part1).toBe("line1\nline2");

    const part2 = await fs.readFile(path.join(tmpDir, "rule-part2.md"), "utf8");
    expect(part2).toBe("line3\nline4");
  });

  it("should insert managed block when file does not exist", async () => {
    const targetFile = path.join(tmpDir, "doc.md");
    await updateFileWithBlock(targetFile, "TEST", "Hello World");

    const content = await fs.readFile(targetFile, "utf8");
    expect(content).toBe("<!-- AWK-START: TEST -->\nHello World\n<!-- AWK-END: TEST -->");
  });

  it("should update block content if block already exists", async () => {
    const targetFile = path.join(tmpDir, "doc.md");
    const initialContent = "Some user comments\n<!-- AWK-START: TEST -->\nOld content\n<!-- AWK-END: TEST -->\nOther user comments";
    await fs.writeFile(targetFile, initialContent, "utf8");

    await updateFileWithBlock(targetFile, "TEST", "New content");

    const updatedContent = await fs.readFile(targetFile, "utf8");
    expect(updatedContent).toBe("Some user comments\n<!-- AWK-START: TEST -->\nNew content\n<!-- AWK-END: TEST -->\nOther user comments");
  });

  it("should append block to end of file if file exists but block does not", async () => {
    const targetFile = path.join(tmpDir, "doc.md");
    const initialContent = "User contents here";
    await fs.writeFile(targetFile, initialContent, "utf8");

    await updateFileWithBlock(targetFile, "TEST", "Block content");

    const updatedContent = await fs.readFile(targetFile, "utf8");
    expect(updatedContent).toBe("User contents here\n\n<!-- AWK-START: TEST -->\nBlock content\n<!-- AWK-END: TEST -->");
  });
});
