/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { promises as fs } from "fs";
import path from "path";

export interface AWKConfig {
  customTemplatesPath?: string;
  plugins?: string[];
}

let loadedConfig: AWKConfig | null = null;
let isLoaded = false;

export async function loadConfig(cwd: string = process.cwd()): Promise<AWKConfig> {
  if (isLoaded) {
    return loadedConfig || {};
  }
  const configPath = path.join(cwd, "awk.config.json");
  try {
    const content = await fs.readFile(configPath, "utf8");
    loadedConfig = JSON.parse(content);
  } catch {
    loadedConfig = {};
  }
  isLoaded = true;
  return loadedConfig || {};
}

export function clearConfigCache() {
  loadedConfig = null;
  isLoaded = false;
}
