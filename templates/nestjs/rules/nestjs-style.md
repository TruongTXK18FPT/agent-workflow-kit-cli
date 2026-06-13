# NestJS Naming Conventions & Coding Style

This document outlines standard guidelines for TypeScript coding styles, filename notations, and class naming conventions in NestJS.

---

## 🏷️ Naming Conventions

### Filename Notation (Dot Notation)
All filenames in NestJS must strictly comply with the following format: `<name>.<type>.ts`.

```bash
# Module directories should use consistent singular or plural names (e.g., auth, users, products)
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
Class names must use `PascalCase` and end with the specific component suffix representing their role:
- **Controller:** `src/auth/auth.controller.ts` $\rightarrow$ `export class AuthController {}`
- **Service:** `src/auth/auth.service.ts` $\rightarrow$ `export class AuthService {}`
- **Module:** `src/auth/auth.module.ts` $\rightarrow$ `export class AuthModule {}`
- **DTO:** `src/auth/dto/login.dto.ts` $\rightarrow$ `export class LoginRequestDto {}`

---

## 📦 TypeScript & Decorator Sorting
- **Decorator Sorting:** Group and organize decorator annotations systematically. Place HTTP methods (`@Get()`, `@Post()`) on top, followed by guards or interceptors (`@UseGuards()`, `@UseInterceptors()`).
- **Explicit Return Types:** Always define clear return types for all Controller and Service methods to guarantee type safety.
- **Strictly Ban the `any` Type:** Avoid generic `any` keywords. Create proper classes, interfaces, or types for all arguments and responses.
