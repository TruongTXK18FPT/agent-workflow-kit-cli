/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { promises as fs } from "fs";
import path from "path";

/**
 * Splits the given string into chunks of at most maxChars.
 * It tries to split at line boundaries to avoid cutting lines or words.
 */
export function chunkText(content: string, maxChars: number = 10000): string[] {
  const lines = content.split("\n");
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;

  for (const line of lines) {
    const lineLen = line.length + 1; // +1 for the newline
    if (currentLength + lineLen > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.join("\n"));
      currentChunk = [];
      currentLength = 0;
    }
    currentChunk.push(line);
    currentLength += lineLen;
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join("\n"));
  }
  return chunks;
}

/**
 * Deletes old rule part files matching the pattern `<rule-name>-part*.md`.
 */
async function cleanOldChunks(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const baseWithoutExt = path.basename(filePath, ext);

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.isFile() &&
        entry.name.startsWith(`${baseWithoutExt}-part`) &&
        entry.name.endsWith(ext)
      ) {
        await fs.unlink(path.join(dir, entry.name));
      }
    }
  } catch {
    // Ignore directory not existing
  }
}

/**
 * Writes rule file content.
 * If the content is longer than 10,000 characters, it chunks it into part files
 * and writes a main rule index referencing them with `@<part-file-name>.md`.
 */
export async function writeRuleWithChunking(
  filePath: string,
  content: string,
  maxChars: number = 10000
): Promise<void> {
  // Ensure the target directory exists
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  // Always clean up old parts first to prevent leftover files
  await cleanOldChunks(filePath);

  if (content.length <= maxChars) {
    await fs.writeFile(filePath, content, "utf8");
    return;
  }

  // Need to chunk
  const chunks = chunkText(content, maxChars);
  const ext = path.extname(filePath);
  const baseWithoutExt = path.basename(filePath, ext);
  const partRefs: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const partFileName = `${baseWithoutExt}-part${i + 1}${ext}`;
    const partPath = path.join(path.dirname(filePath), partFileName);
    await fs.writeFile(partPath, chunks[i], "utf8");
    partRefs.push(`@${partFileName}`);
  }

  // Create main rule index file
  const mainContent = `# ${baseWithoutExt} Rules

This ruleset is split into multiple parts to stay within agent context limitations. The agent MUST load and follow all referenced parts:

${partRefs.map((ref) => `- ${ref}`).join("\n")}
`;

  await fs.writeFile(filePath, mainContent, "utf8");
}

/**
 * Updates a file with a managed block content.
 * If the file does not exist, it creates it with the block wrapper.
 * If the block does not exist in the file, it appends the block wrapper.
 * If the block exists, it replaces the content inside the block.
 */
export async function updateFileWithBlock(
  filePath: string,
  blockId: string,
  newContent: string
): Promise<void> {
  const startTag = `<!-- AWK-START: ${blockId} -->`;
  const endTag = `<!-- AWK-END: ${blockId} -->`;
  const wrappedContent = `${startTag}\n${newContent}\n${endTag}`;

  let fileContent = "";
  try {
    fileContent = await fs.readFile(filePath, "utf8");
  } catch {
    // File doesn't exist, we will create it
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, wrappedContent, "utf8");
    return;
  }

  // Regex to match the block
  const escapedStart = startTag.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const escapedEnd = endTag.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const regex = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`);

  if (regex.test(fileContent)) {
    const updatedContent = fileContent.replace(regex, wrappedContent);
    await fs.writeFile(filePath, updatedContent, "utf8");
  } else {
    // Append to end of file
    const separator =
      fileContent.length > 0 && !fileContent.endsWith("\n") ? "\n\n" : "\n";
    await fs.writeFile(filePath, `${fileContent}${separator}${wrappedContent}`, "utf8");
  }
}
