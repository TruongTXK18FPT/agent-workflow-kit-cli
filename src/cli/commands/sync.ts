/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import chalk from "chalk";
import { runInit } from "./init.js";

interface SyncOptions {
  dryRun: boolean;
}

export async function runSync(options: SyncOptions) {
  await runInit({
    stack: "auto",
    agent: "both",
    dryRun: options.dryRun,
  });
}
