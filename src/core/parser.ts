/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import ts from "typescript";
import { execa } from "execa";

function parseTsImports(content: string): string[] {
  const sourceFile = ts.createSourceFile(
    "file.ts",
    content,
    ts.ScriptTarget.Latest,
    true
  );
  const imports: string[] = [];
  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        imports.push(node.moduleSpecifier.text);
      }
    } else if (ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        imports.push(node.moduleSpecifier.text);
      }
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length > 0
    ) {
      const arg = node.arguments[0];
      if (ts.isStringLiteral(arg)) {
        imports.push(arg.text);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return imports;
}

function fallbackPyImports(content: string): string[] {
  const lines = content.split("\n");
  const imports: string[] = [];
  let inMultiline = false;
  let multilineQuote = "";

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (!inMultiline) {
      if (line.startsWith('"""')) {
        inMultiline = true;
        multilineQuote = '"""';
        if (line.endsWith('"""') && line.length > 3) {
          inMultiline = false;
        }
        continue;
      }
      if (line.startsWith("'''")) {
        inMultiline = true;
        multilineQuote = "'''";
        if (line.endsWith("'''") && line.length > 3) {
          inMultiline = false;
        }
        continue;
      }

      const hashIdx = line.indexOf("#");
      if (hashIdx !== -1) {
        line = line.substring(0, hashIdx).trim();
      }

      const importFromMatch = line.match(/^from\s+([a-zA-Z0-9._]+)\s+import/);
      if (importFromMatch) {
        imports.push(importFromMatch[1]);
      } else {
        const importMatch = line.match(/^import\s+([a-zA-Z0-9._\s,]+)/);
        if (importMatch) {
          const modules = importMatch[1].split(",").map(m => m.trim());
          imports.push(...modules);
        }
      }
    } else {
      if (line.endsWith(multilineQuote)) {
        inMultiline = false;
      }
    }
  }
  return imports;
}

async function parsePyImports(content: string): Promise<string[]> {
  const pyScript = `
import ast, sys, json
try:
    tree = ast.parse(sys.stdin.read())
    imports = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for name in node.names:
                imports.append(name.name)
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imports.append(node.module)
    print(json.dumps(imports))
except Exception:
    sys.exit(1)
  `.trim();

  try {
    const { stdout } = await execa("python", ["-c", pyScript], {
      input: content,
      timeout: 2000,
    });
    return JSON.parse(stdout);
  } catch {
    return fallbackPyImports(content);
  }
}

function parseJavaImports(content: string): string[] {
  const cleaned = content.replace(/\/\*[\s\S]*?\*\//g, "");
  const lines = cleaned.split("\n");
  const imports: string[] = [];

  for (let line of lines) {
    line = line.trim();
    const doubleSlashIdx = line.indexOf("//");
    if (doubleSlashIdx !== -1) {
      line = line.substring(0, doubleSlashIdx).trim();
    }
    if (line.startsWith("import ")) {
      const match = line.match(/^import\s+(?:static\s+)?([a-zA-Z0-9._*]+)\s*;/);
      if (match) {
        imports.push(match[1]);
      }
    }
  }
  return imports;
}

export async function parseImports(filePath: string, content: string): Promise<string[]> {
  const ext = filePath.split(".").pop()?.toLowerCase();
  if (ext === "ts" || ext === "tsx") {
    return parseTsImports(content);
  }
  if (ext === "py") {
    return parsePyImports(content);
  }
  if (ext === "java") {
    return parseJavaImports(content);
  }
  return [];
}
