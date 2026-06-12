# Java Spring Boot Style Constraints

Enforce strict coding style and layer definitions in this repository.

## Coding Style
- Follow standard project style guidelines (default Google Java style).
- Organize imports cleanly: standard java libraries first, third-party libraries second, internal imports last.
- Do not use raw types. Always specify generic parameters.

## Integration & Layers
- Follow rules defined in @AGENTS.md.
- Ensure all custom database queries are covered by repository slice tests (`@DataJpaTest`).
- Before completing work, execute:
  - `{{buildCommand}} {{buildVerifyArgs}}`
