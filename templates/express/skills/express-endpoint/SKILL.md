---
name: express-endpoint
description: Scaffold or extend a secure Express.js + TypeScript API endpoint including Router, Controller, and Validator
---

Follow this process to generate a new Express.js API Endpoint or extend an existing route.

Inputs:
- endpointName: Name of the API Endpoint to create (e.g., `user-profile`)
- routePath: HTTP route path of the API (e.g., `/api/v1/users/profile`)
- httpMethod: HTTP method (GET, POST, PUT, DELETE)
- targetPath: The destination path to place the code files

Steps:
1. Define a Zod Validation Schema under the `middlewares/` directory or alongside the controller to validate input payloads.
2. Implement the corresponding Service function under the `services/` directory to handle 100% of the business logic and ORM queries.
3. Implement the Controller dispatcher in the `controllers/` directory using the `asyncHandler` wrapper to forward errors automatically, extract inputs, and send JSON responses.
4. Register the Controller and mount the `validateSchema(zodSchema)` middleware on the target Route file under the `routes/` directory.
5. Create unit test suites for the Service and integration test suites (E2E) using Supertest.
6. Execute local validation:
   - `{{runCommand}} lint`
   - `{{runCommand}} typecheck`
   - `{{runCommand}} test`
   - `{{runCommand}} build`
