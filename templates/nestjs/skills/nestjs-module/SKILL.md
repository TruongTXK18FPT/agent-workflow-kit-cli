---
name: nestjs-module
description: Automatically scaffold a complete NestJS Module including Controller, Service, DTO, and Entity according to standard conventions
---

Follow this process to generate a new NestJS Module or extend an existing one.

Inputs:
- moduleName: Name of the module to create (e.g., `products`)
- targetPath: The destination path inside `src/` to place the code
- functionality: Summary of the business requirements and endpoints to expose

Steps:
1. Create a module directory `<moduleName>/` under the `src/` directory (e.g., `src/products`).
2. Define the Entity model in the `<moduleName>/entities/` folder.
3. Define the Request/Response DTO classes in the `<moduleName>/dto/` folder. Apply appropriate validation decorators.
4. Implement the Service class in `<moduleName>/` using NestJS Dependency Injection. Write 100% of the business logic here, handle exceptions, and throw explicit HttpExceptions.
5. Implement the Controller class in `<moduleName>/` to map HTTP requests, configure permission checks (Guards), and return the JSON response.
6. Register the Controller and Service inside the module definition file `<moduleName>.module.ts`. Export the Service if other modules need to consume it.
7. Write unit tests for the Service (`.spec.ts`) and create E2E integration test scripts using Supertest.
8. Execute local validation:
   - `{{runCommand}} lint`
   - `{{runCommand}} typecheck`
   - `{{runCommand}} test`
   - `{{runCommand}} build`
