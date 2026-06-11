import { describe, it, expect } from "vitest";
import { parseSkillFile } from "../src/cli/commands/export.js";

describe("Exporter Command Parser", () => {
  it("should parse skill file with YAML frontmatter properly", () => {
    const fileContent = `---
name: custom-name
description: A custom skill description
---
Inputs:
- first input
Steps:
1. Do this
`;
    const parsed = parseSkillFile(fileContent, "default-name");
    expect(parsed.name).toBe("custom-name");
    expect(parsed.description).toBe("A custom skill description");
    expect(parsed.body).toBe("Inputs:\n- first input\nSteps:\n1. Do this");
  });

  it("should use defaultName if no frontmatter is found", () => {
    const fileContent = `Inputs:
- first input
`;
    const parsed = parseSkillFile(fileContent, "default-name");
    expect(parsed.name).toBe("default-name");
    expect(parsed.description).toBe("");
    expect(parsed.body).toBe("Inputs:\n- first input");
  });

  it("should handle single quotes and double quotes in frontmatter keys", () => {
    const fileContent = `---
name: "quoted-name"
description: 'quoted description'
---
body content
`;
    const parsed = parseSkillFile(fileContent, "default-name");
    expect(parsed.name).toBe("quoted-name");
    expect(parsed.description).toBe("quoted description");
    expect(parsed.body).toBe("body content");
  });
});
