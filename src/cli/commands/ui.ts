/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import http from "http";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import { exec } from "child_process";
import { detectProjectModules } from "../../core/detector.js";
import { runInit } from "./init.js";
import { runCreate } from "./create.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface UiOptions {
  port: string;
}

// Map file extensions to MIME types
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// Find static assets directory in dev and production build structures
async function findUiDistDir(): Promise<string> {
  const possiblePaths = [
    // Production path (dist/ui-dist) relative to dist/cli/commands/ui.js
    path.join(__dirname, "..", "..", "..", "ui-dist"),
    // Development path relative to src/cli/commands/ui.ts
    path.join(__dirname, "..", "..", "..", "..", "agent-workflow-kit", "dist"),
  ];

  for (const p of possiblePaths) {
    try {
      const stats = await fs.stat(p);
      if (stats.isDirectory()) {
        return p;
      }
    } catch {
      // Continue searching
    }
  }

  throw new Error("Could not find frontend UI assets directory (ui-dist). Make sure the Vite app is built.");
}

// Open URL in native browser
function openBrowser(url: string) {
  const startCmd = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
  
  if (process.platform === "win32") {
    // Windows start requires extra care with double quotes
    exec(`start "" "${url}"`);
  } else {
    exec(`${startCmd} "${url}"`);
  }
}

export async function runUiServer(options: UiOptions) {
  const port = parseInt(options.port, 10) || 4321;
  const cwd = process.cwd();
  
  let uiDistDir = "";
  try {
    uiDistDir = await findUiDistDir();
  } catch (err) {
    console.error(chalk.red(`\n❌ Error: ${(err as Error).message}`));
    console.log(chalk.yellow("👉 Please run 'npm run build' in the 'agent-workflow-kit' directory first.\n"));
    process.exit(1);
  }

  const server = http.createServer(async (req, res) => {
    // Enable CORS for development mode proxying
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    const url = new URL(req.url || "/", `http://localhost:${port}`);
    const pathname = url.pathname;

    // API - GET /api/status
    if (pathname === "/api/status" && req.method === "GET") {
      try {
        const detected = await detectProjectModules(cwd);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            isLocalCli: true,
            cwd,
            detectedModules: detected,
          })
        );
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: (err as Error).message }));
      }
      return;
    }

    // API - POST /api/generate
    if (pathname === "/api/generate" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", async () => {
        try {
          const config = JSON.parse(body);
          const stack = config.stack || "auto";
          const agent = config.agent || "both";
          const dryRun = !!config.dryRun;

          const logs: string[] = [];
          const originalLog = console.log;
          const originalWarn = console.warn;
          const originalError = console.error;

          // Capture console outputs to send back to the web console UI
          console.log = (...args) => {
            logs.push(args.join(" "));
            originalLog(...args);
          };
          console.warn = (...args) => {
            logs.push("[WARN] " + args.join(" "));
            originalWarn(...args);
          };
          console.error = (...args) => {
            logs.push("[ERROR] " + args.join(" "));
            originalError(...args);
          };

          try {
            await runInit({ stack, agent, dryRun });
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, logs }));
          } catch (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: (err as Error).message, logs }));
          } finally {
            // Restore console methods
            console.log = originalLog;
            console.warn = originalWarn;
            console.error = originalError;
          }
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON payload" }));
        }
      });
      return;
    }

    // API - POST /api/create
    if (pathname === "/api/create" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", async () => {
        try {
          const config = JSON.parse(body);
          const template = config.template || "react-ts";
          const projectName = config.projectName || "my-project";
          const dryRun = !!config.dryRun;

          const logs: string[] = [];
          const originalLog = console.log;
          const originalWarn = console.warn;
          const originalError = console.error;
          const originalExit = process.exit;
          let exitCode: number | null = null;

          // Capture console outputs to send back to the web console UI
          console.log = (...args) => {
            logs.push(args.join(" "));
            originalLog(...args);
          };
          console.warn = (...args) => {
            logs.push("[WARN] " + args.join(" "));
            originalWarn(...args);
          };
          console.error = (...args) => {
            logs.push("[ERROR] " + args.join(" "));
            originalError(...args);
          };

          // @ts-ignore
          process.exit = (code) => {
            exitCode = (code === undefined) ? 1 : Number(code);
            throw new Error(`Process exited with code ${exitCode}`);
          };

          try {
            await runCreate(template, projectName, { dryRun });
            if (exitCode !== null && exitCode !== 0) {
              throw new Error(`Process exited with code ${exitCode}`);
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, logs }));
          } catch (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: (err as Error).message, logs }));
          } finally {
            // Restore console methods and process exit
            console.log = originalLog;
            console.warn = originalWarn;
            console.error = originalError;
            process.exit = originalExit;
          }
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON payload" }));
        }
      });
      return;
    }

    // Serve Static Files
    let filePath = path.join(uiDistDir, pathname === "/" ? "index.html" : pathname);

    // Guard against directory traversal attacks
    if (!filePath.startsWith(uiDistDir)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    try {
      let stats = await fs.stat(filePath);
      if (stats.isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }
      
      const content = await fs.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    } catch {
      // For SPA fallback support: Serve index.html if file not found
      try {
        const indexContent = await fs.readFile(path.join(uiDistDir, "index.html"));
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(indexContent);
      } catch {
        res.writeHead(404);
        res.end("Not Found");
      }
    }
  });

  server.listen(port, () => {
    const localUrl = `http://localhost:${port}`;
    console.log(chalk.bold.green(`\n🖥️  Agent Workflow Kit local dashboard running at: ${localUrl}`));
    console.log(chalk.dim(`Press Ctrl+C to stop the server.\n`));
    
    // Automatically open in user browser
    openBrowser(localUrl);
  });
}
