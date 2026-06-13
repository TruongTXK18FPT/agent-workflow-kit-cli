# Release Process - `agent-workflow-kit-cli`

This document specifies the process for publishing new versions of the command-line package `agent-workflow-kit-cli` to the npm registry safely, systematically, and with minimal risk of production bugs.

---

## 🛠️ Current NPM Registry Status
- **Package Name:** `agent-workflow-kit-cli`
- **Default NPM Registry:** `https://registry.npmjs.org/`
- **Security Requirement:** The project's NPM Token must be stored in GitHub Secrets as `NPM_TOKEN` to enable automated publishing via CI/CD.

---

## 📋 Release Checklist

The release process consists of 4 mandatory stages:

### Stage 1: Preparation & Local Verification
Before creating any new version tag on Git, the responsible developer (or Agent) must perform the following steps locally:

1. **Clean Development Environment:**
   ```bash
   # Remove node_modules and old build artifacts
   rm -rf node_modules dist
   
   # Perform a clean install of dependencies from the lockfile
   npm ci
   ```
2. **Compile Check & Run Tests:**
   ```bash
   # Compile TypeScript and run Vitest
   npm run build
   npm test
   ```
   *Requirement: 100% of test cases must be **PASSED**.*

3. **Packaging Dry-Run:**
   ```bash
   # Package the project locally
   npm pack
   ```
   *Verify the generated `.tgz` file:*
   - Manually extract the archive to ensure it contains no raw TypeScript source files (`.ts`) or the `tests/` directory.
   - Confirm all distribution files are present: `dist/`, `templates/`, `LICENSE`, `README.md`.
   - Delete the `.tgz` file once verified.

---

### Stage 2: Bump Version & Tagging
Once local validation passes perfectly, perform the version bump following [Semantic Versioning (SemVer)](https://semver.org/):

1. **Run the NPM version command:**
   ```bash
   # Use one of the three options: patch, minor, or major
   # For example, to bump a patch version:
   npm version patch
   ```
   *This command will automatically:*
   - Update the version number in `package.json` and `package-lock.json`.
   - Create an automated Git commit containing this change.
   - Create a corresponding Git tag (e.g., `v1.0.1`).

2. **Push source code and tags to GitHub:**
   ```bash
   git push origin main --tags
   ```

---

### Stage 3: Automated CI/CD via GitHub Actions
When a `v*` tag is pushed to GitHub, the workflow [release.yml](file:///.github/workflows/release.yml) is automatically triggered:

1. **Run Test Job:**
   - Runs the entire Vitest suite on a matrix of Node.js versions (`18.x`, `20.x`, `22.x`) on clean Linux runners.
2. **Run Publish Job:**
   - If the Test Job completes successfully, the system automatically authenticates with the npm registry using `NODE_AUTH_TOKEN` (retrieved from GitHub Secrets `NPM_TOKEN`).
   - Runs the production compilation (`npm run build`).
   - Executes `npm publish` to publish the package to the npm registry.

---

### Stage 4: Post-Release Verification
To ensure end-users receive the correct installation:

1. **Create an empty test directory** completely outside your workspace.
2. **Execute directly via `npx`:**
   ```bash
   npx agent-workflow-kit-cli@latest init --dry-run
   ```
3. **Verify Results:**
   - Verify that the CLI downloads, runs successfully, and prints the correct UX messages/paths.
