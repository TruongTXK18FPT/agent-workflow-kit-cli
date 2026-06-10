---
name: fastapi-feature
description: Generates or extends a Python FastAPI endpoint/module
---

Follow this workflow to create a new API router or feature slice in the project.

Inputs:
- featureName: Name of the feature (e.g., `items`)
- endpointPath: Base path of the router (e.g., `/items`)

Steps:
1. Create schema models under `app/schemas/` using Pydantic.
2. Create CRUD operations under `app/crud/` using SQLAlchemy.
3. Write business logic service under `app/services/` if needed.
4. Implement the API router under `app/api/v1/endpoints/`.
5. Write integration tests using pytest and AsyncClient.
6. Verify code formatting and linting using Ruff.
