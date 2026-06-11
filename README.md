<p align="center">
  <img src="https://raw.githubusercontent.com/TruongTXK18FPT/agent-workflow-kit-cli/main/src/assets/Logo.png" alt="agent-workflow-kit-cli Logo" width="180" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" />
</p>

<h1 align="center">agent-workflow-kit-cli</h1>

<p align="center">
  <strong>A Repo-First AI Workflow Generator & Guideline Optimizer for Codex and Antigravity</strong>
</p>

<p align="center" style="display: flex; align-items: center; justify-content: center; gap: 20px;">
  <span>Designed & Optimized for:</span>
  <br />
  <a href="https://github.com/TruongTXK18FPT/agent-workflow-kit-cli" style="text-decoration: none; display: inline-flex; align-items: center; gap: 6px; font-weight: bold; color: #fff;">
    <img src="src/assets/Codex.png" alt="Codex Logo" width="24" style="vertical-align: middle; border-radius: 4px;" /> Codex
  </a>
  <span style="color: #4b5563;">|</span>
  <a href="https://github.com/TruongTXK18FPT/agent-workflow-kit-cli" style="text-decoration: none; display: inline-flex; align-items: center; gap: 6px; font-weight: bold; color: #fff;">
    <img src="src/assets/Antigravity.webp" alt="Antigravity Logo" width="24" style="vertical-align: middle; border-radius: 4px;" /> Antigravity
  </a>
</p>

<p align="center">
  <a href="https://github.com/TruongTXK18FPT/agent-workflow-kit-cli">
    <img src="https://img.shields.io/github/license/TruongTXK18FPT/agent-workflow-kit-cli?style=for-the-badge&color=blue" alt="License" />
  </a>
  <a href="https://github.com/TruongTXK18FPT/agent-workflow-kit-cli/stargazers">
    <img src="https://img.shields.io/github/stars/TruongTXK18FPT/agent-workflow-kit-cli?style=for-the-badge&color=gold" alt="Stars" />
  </a>
  <a href="https://github.com/TruongTXK18FPT/agent-workflow-kit-cli/issues">
    <img src="https://img.shields.io/github/issues/TruongTXK18FPT/agent-workflow-kit-cli?style=for-the-badge&color=red" alt="Issues" />
  </a>
</p>

---

## 📖 Introduction

`agent-workflow-kit-cli` is an open-source, CLI-driven **repo-first workflow package generator** built specifically for software development teams utilizing AI coding agents like **OpenAI Codex** and **Google Antigravity**. 

Rather than relying on model fine-tuning or heavy ad-hoc prompting, this kit allows you to generate standardized coding structures, workspace rule-bases, custom skill files, and automated testing validations directly inside your repository. By placing machine-readable instructions directly in your repository layout (`AGENTS.md`, `.agents/skills`, `.agents/rules`), AI agents are instantly aligned with your technology stacks, architecture principles, formatting conventions, and done criteria from their very first command.

---

## ⚡ Key Features

- **Automatic Stack Detection:** Scans repository manifests (`pom.xml`, `package.json`, `pyproject.toml`) to automatically configure directory architectures and templates.
- **Unified Multi-Agent Compatibility:** Seamlessly generates standard instructions compatible with both Codex (`AGENTS.md`) and Antigravity (`GEMINI.md`).
- **Standardized Skills & Rules:** Auto-emits persistent agent skills (slash command extensions) and syntax/lint constraints.
- **Opinionated Architectural Presets:** Encourages clean-ish, modular layouts (e.g. `feature-first` structure) that minimize AI token consumption and narrow down execution context.
- **Verification Hook Validation:** Integrates with local toolchains (Maven verify, Vitest, Ruff, pytest, Checkstyle, Spotless) to verify agent edits before commits.

---

## 🏗️ Core Architecture

The kit is structured around a decoupled pipelines approach to separate stack logic from specific agent formats.

```mermaid
flowchart TB
    A[npx agent-workflow-kit-cli] --> B[CLI Commands: init / add / sync / doctor]
    B --> C[Core Parser & Orchestrator]
    C --> D[Stack Detectors: Maven / NPM / Poetry]
    C --> E[Stack Packs: Spring Boot / React / FastAPI]
    C --> F[Agent Emitters: Codex / Antigravity]
    
    F --> G1[AGENTS.md & GEMINI.md]
    F --> G2[.agents/skills/*.md]
    F --> G3[.agents/rules/*.md]
    F --> G4[.codex/rules/*.rules]
```

### Module Structure

- **`src/cli/`**: Parses commands and argument settings via Commander.
- **`src/core/`**: Controls code generation flow, schemas, file merges, and dry-run comparisons.
- **`src/detectors/`**: Identifies local build configurations and monorepos.
- **`src/presets/`**: Manages default templates for architectural designs, styles, linters, tests, and CI/CD pipelines.
- **`src/packs/`**: Holds modular logic packs for Spring Boot, React + TS, and FastAPI.
- **`src/emitters/`**: Translates templates into target markdown configs.
- **`templates/`**: Multi-language Handlebars templates.

---

## 📦 Supported Stack Packs & Workflows

### ☕ Java Spring Boot Pack
Designed for robust enterprise backend environments.
- **Default Architecture:** Feature-first modular packages containing inner layers (dto, entity, repository, mapper, service, web).
- **Tooling Defaults:** Checkstyle (coding formatting), Spotless (auto-format validation), Maven compiler (Java 17+).
- **Test Slices:** Service Unit Tests, Web Controllers (`@WebMvcTest`), JPA repositories (`@DataJpaTest`).

#### Spring Boot Folder Structure Example:
```text
src/main/java/com/acme/app/
  customer/
    dto/
      CreateCustomerRequest.java
      CustomerResponse.java
    entity/
      Customer.java
    mapper/
      CustomerMapper.java
    repository/
      CustomerRepository.java
    service/
      CustomerService.java
      impl/CustomerServiceImpl.java
    web/
      CustomerController.java
```

---

### ⚛️ React + TypeScript Pack
Tailored for scalable component-driven frontend developments.
- **Default Architecture:** Feature-first modules with localized state hooks, routing wrappers, and style files.
- **Tooling Defaults:** Vite (bundler), TypeScript Strict Compiler Settings, ESLint Flat Config, Prettier.
- **Test Slices:** React Testing Library + Vitest + jest-dom.

#### React + TypeScript Configs:
```ts
// eslint.config.mjs
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  }
);
```

---

### 🐍 Python FastAPI Pack
Optimized for high-performance python API layers.
- **Default Architecture:** Feature router packages with localized schema, service, and database models.
- **Tooling Defaults:** Ruff (extremely fast Python linter & formatter), mypy (strict type-checking), Python 3.11+.
- **Test Slices:** Pytest + TestClient (HTTPX).

#### FastAPI Configuration:
```toml
# pyproject.toml
[tool.ruff]
line-length = 100

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP"]

[tool.mypy]
python_version = "3.11"
strict = true
packages = ["src"]
```

---

## 🚀 Quick Start

Initialize the toolkit instantly inside your project repository using `npx` (no local installation required):

```bash
# 1. Initialize rules and custom skills for the project
npx agent-workflow-kit-cli init

# 2. View the generated AGENTS.md guidelines at your repository root
cat AGENTS.md

# 3. Export custom skills to register them with Antigravity
npx agent-workflow-kit-cli export antigravity

# 4. Enable pre-commit auto-validation hook
npx agent-workflow-kit-cli doctor --install-hook
```

---

## 🛠️ CLI Reference

You can run `agent-workflow-kit-cli` directly via `npx` or install it locally:

```bash
npx agent-workflow-kit-cli <command> [options]
```

### 1. `init`
Analyzes the directory manifests (`package.json`, `pom.xml`, `pyproject.toml`) and bootstraps agent guidelines (`AGENTS.md`) and custom skills (`.agents/`).

* **Usage:** `npx agent-workflow-kit-cli init [options]`
* **Options:**
  * `--stack <stack>`: Specify the target project stack.
    * Values: `auto`, `spring-boot`, `react-ts`, `fastapi`
    * Default: `auto` (auto-detects project manifests)
  * `--agent <agent>`: Target profile settings.
    * Values: `both`, `codex`, `antigravity`
    * Default: `both`
  * `--dry-run`: Run the command in simulation mode. Logs actions to the console without writing any files to disk.

---

### 2. `sync`
Re-evaluates the manifests and updates existing guidelines/skills inside the workspace without touching user modifications. It writes changes inside the `<!-- AWK-START: <id> -->` managed blocks.

* **Usage:** `npx agent-workflow-kit-cli sync [options]`
* **Options:**
  * `--dry-run`: Simulation mode. Logs planned sync modifications to the console without updating files.

---

### 3. `doctor`
Checks consistency of active agent configurations, environment setups, and executes the validation test commands configured for detected stacks.

* **Usage:** `npx agent-workflow-kit-cli doctor [options]`
* **Options:**
  * `--install-hook`: Installs a local Git `pre-commit` hook to automatically trigger `doctor` checks before commit validation. If the checks fail, the commit is aborted.

---

### 4. `export <target>`
Exports and bundles custom workflows and skills in `.agents/skills/` into a single consolidated string optimized for the target AI agent console.

* **Usage:** `npx agent-workflow-kit-cli export <target> [options]`
* **Arguments:**
  * `<target>`: The name of the target agent (e.g., `antigravity`).
* **Options:**
  * `--no-clipboard`: Prevents the CLI from copying the bundled instructions directly to the system clipboard (by default, it will attempt to copy to the clipboard first, fallback to printing on stdout).

---

## 🤖 Agent Integration Details

### Shared Directives Layer (`AGENTS.md`)
Placed in the workspace root, `AGENTS.md` is automatically ingested at the beginning of the agent session. It sets expectations for file naming, layering constraints, package manager usage, and completion checklists.

### Slash-Command Skills (`.agents/skills/`)
Custom agent capabilities are placed inside `.agents/skills/<skill-name>/SKILL.md`. Both Codex and Antigravity ingest these to expose custom workflows invoked via commands (like `/spring-feature` or `/react-route`).

#### Typical `SKILL.md` Example:
```md
---
name: react-feature
description: Generates custom React component hooks and routes
---
Inputs:
- component name
- target path

Steps:
1. Examine neighboring route components
2. Create types.ts contract
3. Implement hooks and main UI components
4. Run validation checks: npm run lint && npm run build
```

### Antigravity-Specific Constraints (`.agents/rules/`)
Google Antigravity rules are written as Markdown documents in `.agents/rules/*.md`.
> [!IMPORTANT]
> Antigravity enforces a strict limit of **12,000 characters** per rule file. Keep generated rules thin and refer to external documents like `@AGENTS.md` to avoid truncations.

---

## 🧪 Development & Testing

We maintain a rigorous pipeline to test changes made to this CLI toolkit.

### Local Setup
Ensure you have Node.js 20+ installed. Clone the repository and install dependencies:
```bash
git clone https://github.com/TruongTXK18FPT/agent-workflow-kit-cli.git
cd agent-workflow-kit-cli
npm install
```

### Running Tests
We use **Vitest** for testing:
- **Unit Tests:** Validates manifest detectors and template parsing.
- **Fixture Tests:** Performs snapshot checks against baseline directories to check for file output drifts.

```bash
# Run all vitest suites
npm test
```

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more details.

---

<p align="center">
  For more details, issues, and feature requests, visit the official repository:
  <br />
  <strong><a href="https://github.com/TruongTXK18FPT/agent-workflow-kit-cli">https://github.com/TruongTXK18FPT/agent-workflow-kit-cli</a></strong>
</p>
