/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.resolve(__dirname, "..", "..", "agent-workflow-kit", "dist");
const TARGET_DIR = path.resolve(__dirname, "..", "ui-dist");

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function main() {
  console.log("📦 Copying frontend UI static assets to CLI package...");

  try {
    const sourceExists = await fs.access(SOURCE_DIR).then(() => true).catch(() => false);
    if (!sourceExists) {
      console.error(`\n❌ Error: Source directory not found: ${SOURCE_DIR}`);
      console.error("👉 Please build the Vite project first: run 'npm run build' inside '../agent-workflow-kit'\n");
      process.exit(1);
    }

    // Clean target directory
    await fs.rm(TARGET_DIR, { recursive: true, force: true });
    
    // Copy directory
    await copyDir(SOURCE_DIR, TARGET_DIR);
    console.log(`✔️ Successfully copied UI assets to: ${TARGET_DIR}\n`);
  } catch (err) {
    console.error("❌ Failed to copy assets:", err);
    process.exit(1);
  }
}

main();
