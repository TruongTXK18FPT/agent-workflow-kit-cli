---
name: nestjs-module
description: Generates or extends a NestJS + TypeScript module with Controller, Service, DTO, and Entity layers
---

Follow this workflow to create a new NestJS module or extend an existing module.

Inputs:
- moduleName: Name of the module (e.g. `users`)
- targetPath: Subdirectory under `src/` to place the module files
- functionality: Summary of endpoints and business logic required

Steps:
1. Construct the module directory `<moduleName>/` under `src/`.
2. Declare and create the Entity model under `<moduleName>/entities/`.
3. Declare and create request/response DTOs under `<moduleName>/dto/`. Add appropriate class-validator decorators.
4. Implement the Service class under `<moduleName>/` with dependency injection constructors. Keep business logic and HttpExceptions mapping here.
5. Create the Controller under `<moduleName>/` to handle endpoint requests, bind validations, and return JSON responses.
6. Register the Controller and Service inside the parent module file `<moduleName>.module.ts`, exporting the Service if external modules require it.
7. Write Service Unit tests (`.spec.ts`) and add E2E integration test routines.
8. Run validations:
   - `{{runCommand}} lint`
   - `{{runCommand}} typecheck`
   - `{{runCommand}} test`
   - `{{runCommand}} build`
