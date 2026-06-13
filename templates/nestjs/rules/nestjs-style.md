# NestJS Coding Style & Naming Rules

This ruleset governs files structure naming, class naming, and coding conventions for NestJS applications.

---

## 🏷️ Naming Conventions

### File Naming (Dot Notation)
- All files in NestJS must follow the structure: `<object-name>.<component-type>.ts`.
- Subdirectories inside a module (e.g. `dto`, `entities`, `guards`) hold specific layers.
- Modules folders should be named consistently in singular or plural lowercase:
  ```text
  src/users/
  ├── users.module.ts
  ├── users.controller.ts
  ├── users.service.ts
  ├── dto/
  │   ├── create-user-request.dto.ts
  │   └── update-user-response.dto.ts
  ├── entities/
  │   └── user.entity.ts
  ├── guards/
  │   └── roles.guard.ts
  └── interceptors/
      └── logging.interceptor.ts
  ```

### Class Naming
- Class names must be written in `PascalCase` and end with their respective component type suffix:
  - Controller: `users.controller.ts` $\rightarrow$ `export class UsersController {}`
  - Service: `users.service.ts` $\rightarrow$ `export class UsersService {}`
  - Module: `users.module.ts` $\rightarrow$ `export class UsersModule {}`
  - DTO: `dto/create-user-request.dto.ts` $\rightarrow$ `export class CreateUserRequestDto {}`
  - Entity: `entities/user.entity.ts` $\rightarrow$ `export class UserEntity {}`

---

## 📦 TypeScript & Formatting Standards
- **Decorator Ordering**: Group decorators logically. Place controller HTTP methods (`@Get()`, `@Post()`) above validation modifiers (`@UseGuards()`, `@UseInterceptors()`).
- **Interfaces**: Prefer type safety interfaces for service APIs. For example, Controller expects a return type contract that matches DTO or Entity shapes.
- **Strict Linting**: Conforms to TypeScript lint rules before committing code. Avoid `any` types; declare explicit class-based schemas.
