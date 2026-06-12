---
name: ai-agent
description: Generates or extends an LLM agent workflow or prompt configuration
---

Follow this workflow to build a new LLM agent, tool registry, or prompt context loop.

Inputs:
- agentName: Name of the agent component (e.g., `doc_summarizer`)
- llmClient: Target LLM model/API (e.g., `openai`, `gemini`, `ollama`)

Steps:
1. Examine existing LLM adapters, configuration settings, and prompts in the codebase.
2. Define the system prompt templates:
   - Save prompts as configuration files (JSON/YAML) or static templates. Do not hardcode long string templates in raw python files.
3. Implement the Agent client/runner class:
   - Set up API keys dynamically from environment variables (no hardcoded secrets).
   - Implement tool registrations (e.g. function calling definitions) with strict parameter validations.
   - Enforce memory state preservation (e.g., session handling, conversation buffers).
4. Add unit and integration tests:
   - Mock API client calls to avoid charging external keys during test runs.
   - Verify tool parameter validation errors return correct user warning boundaries.
5. Run validations:
   - Run tests and quality verification commands.
