# Python Code Style Rules

All python code in this project must conform to the following formatting and styling requirements:
- Use PEP 8 conventions.
- Format all files with Ruff.
- Imports must be sorted using Ruff or isort.
- Use explicit type annotations everywhere.

## Naming
- Variables, functions, modules, and API helper functions must use `snake_case`.
- Classes, exceptions, and Pydantic schemas must use `PascalCase`.
- Pydantic schemas for incoming writes must use intent suffixes:
  - `UserCreate` for create payloads.
  - `UserUpdate` for partial or full update payloads.
  - `UserRead` or `UserResponse` for response payloads, following the local convention.
- Repository and service functions should describe actions with verbs, for example `get_user`, `list_users`, `create_user`, `update_user`, and `delete_user`.

## API Endpoint Naming
- Route path segments must be lowercase nouns, singular or plural according to the existing local convention: `/users`, `/user-profiles`, `/orders/{order_id}`.
- Do not encode actions in REST resource paths when an HTTP method already expresses the action.
- Path parameters must use `snake_case`, for example `{user_id}`.
- Router variables should be named `router`; shared dependency functions should use clear `snake_case` names.
