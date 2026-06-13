# Express.js Coding Style & Naming Rules

This ruleset governs files structure naming, imports, and TypeScript coding conventions for Express.js applications.

---

## 🏷️ Naming Conventions

### File Naming (Kebab Case & Suffixes)
- **Kebab Case**: To maintain absolute consistency across the repository, all file names must follow the `kebab-case.ts` format.
- **Architectural Suffixes**: File names must explicitly include their architectural role as a suffix:
  - Controller: `user-controller.ts`
  - Service: `user-service.ts`
  - Route: `user-route.ts`
  - Middleware: `auth-middleware.ts`, `validate-middleware.ts`
  - Model: `user-model.ts`

### Code Naming Conventions
- Classes: PascalCase (e.g. `UserController`, `UserService`).
- Variables, functions, routes path names: camelCase (e.g. `getUserProfile`, `validateSchema`, `/api/v1/user-profiles`).

---

## 📦 TypeScript & Formatting Standards
- **Explicit Types**: Do not rely on implicit return types. Annotate Express controller route functions parameters with their explicit types imported from `express`:
  ```typescript
  import { Request, Response, NextFunction } from "express";
  ```
- **Response Wrapper Types**: Declare interface schemas for success and error payloads. Avoid returning untyped object literals inside `res.json()`.
- **Encapsulated Dependencies**: Controllers should import services via class instances or exports. Do not declare global variables.
