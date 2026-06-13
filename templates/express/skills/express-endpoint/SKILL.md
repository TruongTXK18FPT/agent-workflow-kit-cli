---
name: express-endpoint
description: Generates or extends an Express.js + TypeScript API endpoint with Router, Controller, Service, and Schema validations
---

Follow this workflow to create a new Express.js API endpoint or extend an existing route.

Inputs:
- endpointName: Name of the endpoint (e.g. `user-profile`)
- routePath: Target HTTP route path (e.g. `/api/v1/users/profile`)
- httpMethod: HTTP method (GET, POST, PUT, DELETE)
- targetPath: The base project directory to place the files

Steps:
1. Declare the Zod validation schemas under the `middlewares/` or `controllers/` folder to check request headers/body/query parameters.
2. Implement the Service function under `services/` to capture 100% of the core business logic, database ORM queries, and calculation routines.
3. Implement the Controller route handler under `controllers/` using the `asyncHandler` wrapper to extract inputs, call the Service, and output JSON payloads.
4. Bind the Controller method and the Zod schema validation middleware (`validateSchema`) to the Route declaration inside `routes/`.
5. Add unit test suites for the Service class and integration test routines using Supertest.
6. Run validations:
   - `{{runCommand}} lint`
   - `{{runCommand}} typecheck`
   - `{{runCommand}} test`
   - `{{runCommand}} build`
