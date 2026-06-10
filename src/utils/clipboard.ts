/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { execa } from "execa";

/**
 * Copies the provided text to the system clipboard in a cross-platform manner using execa.
 */
export async function writeToClipboard(text: string): Promise<boolean> {
  try {
    if (process.platform === "win32") {
      // Use clip command on Windows
      await execa("clip", { input: text });
      return true;
    } else if (process.platform === "darwin") {
      // Use pbcopy on macOS
      await execa("pbcopy", { input: text });
      return true;
    } else {
      // Linux: try xclip first, fallback to xsel
      try {
        await execa("xclip", ["-selection", "clipboard"], { input: text });
        return true;
      } catch {
        await execa("xsel", ["--clipboard", "--input"], { input: text });
        return true;
      }
    }
  } catch (err) {
    return false;
  }
}
