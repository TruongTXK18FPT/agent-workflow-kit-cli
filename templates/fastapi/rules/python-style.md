# Python Code Style Rules

- Follow PEP 8. Format & sort imports with Ruff.
- Require explicit type annotations everywhere.

## Naming
- Variables, functions, modules: `snake_case`.
- Classes, exceptions, Pydantic schemas: `PascalCase`.
- Write schemas suffixes: `UserCreate` (creation), `UserUpdate` (updates).
- Response schemas: `UserRead` or `UserResponse`.
- Actions: Verb prefix (`get_user`, `create_user`).

## API Endpoints
- Paths: Lowercase nouns (`/users`, `/user-profiles`, `/orders/{order_id}`).
- Avoid verbs in REST paths (use HTTP methods instead).
- Path parameters: `snake_case` (e.g. `{user_id}`).
- Routers: Name variables `router`.
