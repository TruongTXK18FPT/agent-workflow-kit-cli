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

### 🌐 Next.js Frontend Pack
Tailored for Next.js App or Pages Router web application structures.
- **Default Architecture:** Standard layouts, page component separations, and shared Tailwind/styling assets.
- **Tooling Defaults:** Next CLI tools, ESLint, strict TypeScript rules.

---

### 🛡️ NestJS & Express Backend Packs
Designed for structured modular Node.js backend systems.
- **Default Architecture:** Dependency injection modular patterns (NestJS) or routing/middleware setups (Express).
- **Tooling Defaults:** ESLint, Prettier, and Vitest/Jest for automated testing.

---

### 🤖 Python AI Pack
Custom-tailored rules and structures for AI modeling, machine learning, and data science.
- **Default Architecture:** Machine learning pipelines, model loaders, script helpers, and notebook guides.
- **Tooling Defaults:** Ruff linting, mypy strict type checking, and standard AI environment libraries.

---

### ⚙️ .NET Core C# Pack
Designed for enterprise-level applications written in C# on .NET Core.
- **Default Architecture:** Clean-architecture layers (controllers, application services, domain interfaces, and infrastructure/data layers).
- **Tooling Defaults:** C# styling guides, standard `dotnet test` suites.

---

### 🐹 Go Pack
High-performance Go backend structures.
- **Default Architecture:** Go standard layout structures, clear service boundary interfaces, and separation of concerns.
- **Tooling Defaults:** `go fmt`, `go vet`, and standard go test execution.

---

### 🦀 Rust Pack
Memory-safe, high-performance systems and backend libraries in Rust.
- **Default Architecture:** Workspace modules, cargo configurations, and library/binary structures.
- **Tooling Defaults:** `cargo clippy`, `cargo fmt`, and standard Rust test suites.

---

### 📦 DevOps Stack Pack
Standardizes container, pipeline, and automation configurations.
- **Default Architecture:** Multi-stage Dockerfiles, Docker Compose environment setups, and CI/CD pipelines (GitHub Actions, GitLab CI).

---

### 📊 Diagram Pack
Organizes system designs and architectures using standard diagrams.
- **Default Architecture:** Standard guidelines for UML, Mermaid blocks, and PlantUML designs.

---

## 🚀 Quick Start

Initialize the toolkit instantly inside your project repository using `npx` (no local installation required):

```bash
# 1. Launch the local configuration wizard web dashboard (Optional)
npx agent-workflow-kit-cli ui

# 2. Or initialize rules and custom skills directly via CLI
npx agent-workflow-kit-cli init

# 3. View the generated AGENTS.md guidelines at your repository root
cat AGENTS.md

# 4. Export custom skills to register them with Antigravity
npx agent-workflow-kit-cli export antigravity

# 5. Enable pre-commit auto-validation hook
npx agent-workflow-kit-cli doctor --install-hook
```

---

## 🛠️ CLI Reference

You can run `agent-workflow-kit-cli` directly via `npx` or install it locally:

```bash
npx agent-workflow-kit-cli <command> [options]
```

### 1. `init`
Analyzes the directory manifests (`package.json`, `pom.xml`, `pyproject.toml`, etc.) and bootstraps agent guidelines (`AGENTS.md`) and custom skills (`.agents/`).

* **Usage:** `npx agent-workflow-kit-cli init [options]`
* **Options:**
  * `--stack <stack>`: Specify the target project stack.
    * Values: `auto`, `spring-boot`, `react-ts`, `next-js`, `nestjs`, `express`, `fastapi`, `python-ai`, `dotnet`, `golang`, `rust`, `devops`, `diagram`
    * Default: `auto` (auto-detects project manifests)
  * `--agent <agent>`: Target profile settings.
    * Values: `both`, `codex`, `antigravity`
    * Default: `both`
  * `--dry-run`: Run the command in simulation mode. Logs actions to the console without writing any files to disk.

---

### 2. `ui`
Launches the local configuration wizard web dashboard in your browser.

* **Usage:** `npx agent-workflow-kit-cli ui [options]`
* **Options:**
  * `-p, --port <port>`: Port to run the UI server on.
    * Default: `4321`

---

### 3. `add <stack>`
Manually installs a specific stack pack guidelines and templates to a folder.

* **Usage:** `npx agent-workflow-kit-cli add <stack> [options]`
* **Arguments:**
  * `<stack>`: The stack pack name (e.g. `spring-boot`, `react-ts`, `rust`, etc.).
* **Options:**
  * `--path <path>`: Target folder path to install the guidelines (default: `.`).
  * `--agent <agent>`: Specify target agent profile: `both | codex | antigravity` (default: `both`).
  * `--dry-run`: Simulation mode. Logs actions without writing files to disk.

---

### 4. `sync`
Re-evaluates the manifests and updates existing guidelines/skills inside the workspace without touching user modifications. It writes changes inside the `<!-- AWK-START: <id> -->` managed blocks.

* **Usage:** `npx agent-workflow-kit-cli sync [options]`
* **Options:**
  * `--dry-run`: Simulation mode. Logs planned sync modifications to the console without updating files.

---

### 5. `doctor`
Checks consistency of active agent configurations, environment setups, and executes the validation test commands configured for detected stacks.

* **Usage:** `npx agent-workflow-kit-cli doctor [options]`
* **Options:**
  * `--install-hook`: Installs a local Git `pre-commit` hook to automatically trigger `doctor` checks before commit validation. If the checks fail, the commit is aborted.

---

### 6. `export <target>`
Exports and bundles custom workflows and skills in `.agents/skills/` into a single consolidated string optimized for the target AI agent console.

* **Usage:** `npx agent-workflow-kit-cli export <target> [options]`
* **Arguments:**
  * `<target>`: The name of the target agent (e.g., `antigravity`).
* **Options:**
  * `--no-clipboard`: Prevents the CLI from copying the bundled instructions directly to the system clipboard (by default, it will attempt to copy to the clipboard first, fallback to printing on stdout).
  * `-o, --output <file>`: Write the exported guidelines to a specific file.

---

### 7. `run <workflow>`
Runs an AWOS graph workflow directly from the command line.

* **Usage:** `npx agent-workflow-kit-cli run <workflow> [options]`
* **Arguments:**
  * `<workflow>`: Path to the workflow JSON configuration.
* **Options:**
  * `--inputs <inputs>`: Path to input parameters JSON file or inline JSON string.
  * `--dry-run`: Run workflow nodes in dry-run simulation mode.

---

### 8. `resume <runId>`
Resumes a suspended or paused AWOS workflow run.

* **Usage:** `npx agent-workflow-kit-cli resume <runId>`
* **Arguments:**
  * `<runId>`: The ID of the suspended workflow run.

---

### 9. `profile`
Validates directory architecture structure and rule boundaries using custom structural rules.

* **Usage:** `npx agent-workflow-kit-cli profile [options]`
* **Options:**
  * `--profile <profile>`: Target profile name (e.g. `clean-architecture`).

---

### 10. `workflow` (Subcommands)
Manage and execute registered AWOS workflow packs.

* **Subcommands:**
  * `list`: List all discovered/registered workflow packs.
  * `show <id>`: Show details, steps, and metadata of a workflow pack.
  * `validate <id>`: Validate a workflow pack's JSON schema and graph cycle constraints.
  * `run <id> [options]`: Execute a registered workflow pack by ID (options: `--inputs`, `--dry-run`).

---

### 11. `role` (Subcommands)
Manage agent role profiles.

* **Subcommands:**
  * `list`: List all discovered agent role profiles in the catalog.
  * `show <id>`: Show agent role details, checkpoints, and inputs schema.
  * `validate`: Validate all role catalog configuration files against schema parameters.

---

### 12. `adr` (Subcommands)
Manage Architectural Decision Records (ADR).

* **Subcommands:**
  * `create [options]`: Create a new numbered ADR document. Options:
    * `--title <title>`: ADR title.
    * `--status <status>`: Status: `proposed | accepted | rejected | superseded` (default: `proposed`).
    * `--context <context>`: Background context.
    * `--decision <decision>`: Decision details.
    * `--consequences <consequences>`: Repercussions/consequences.
    * `--decision-maker <maker>`: Name/role of decision maker (default: `AWOS System`).
  * `list`: List all saved ADR documents.
  * `show <id>`: Display details of a numbered ADR document.
  * `search <keyword>`: Search all ADR documents for keyword text matches.

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
