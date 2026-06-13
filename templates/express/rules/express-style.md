# Express.js Naming Conventions & Coding Style

This document defines coding conventions, directory layout, and TypeScript configurations for Express.js applications.

---

## 🏷️ Naming Conventions

### Directory Layout (3-Tier Architecture)
The codebase must be structured cleanly according to a 3-tier architecture layout:
```bash
src/
├── config/             # Environment configurations, DB initializations
├── middlewares/        # Express middleware functions (Auth, Log, Validation)
├── models/             # Database Schemas (Mongoose, Sequelize, or Prisma client)
├── routes/             # HTTP Route definitions and input middleware binding
├── controllers/        # Request parameter extraction, response formatting
├── services/           # Houses 100% of business logic and computations
├── utils/              # Standalone utility helper functions
└── app.ts              # Express App setup and server bootstrapping
```

### Filename Notation
- **Consistency:** Use `kebab-case.ts` across all filenames in the repository.
- **Suffix Declarations:** Filenames must end with a suffix representing their architectural role:
  - Controller: `user-controller.ts`
  - Service: `user-service.ts`
  - Route: `user-route.ts`
  - Middleware: `auth-middleware.ts`, `validate-middleware.ts`
  - Model: `user-model.ts`

---

## 📦 TypeScript & Type Declarations
- **Explicit Type Declarations:** Avoid implicit type inference. Always define types for `req`, `res`, and `next` parameters imported from `express`:
  ```typescript
  import { Request, Response, NextFunction } from 'express';
  ```
- **Strictly Ban the `any` Keyword:** Declare interfaces or types for all request bodies and API response structures.
